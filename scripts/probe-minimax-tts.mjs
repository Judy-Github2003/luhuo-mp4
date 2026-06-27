// scripts/probe-minimax-tts.mjs
//
// 中文 word_streaming 探针:打 T2A v2 一次,把 response 关键字段打印出来。
// 用来确认:
//   1. 中文能否开启 subtitle_enable / word_streaming
//   2. SSE chunk 的 status 编号行为是否和英文一致 (1=中间, 2=终态)
//   3. 词级时间戳字段结构 (time_begin / word_begin 等)
//   4. 中文是否也有"音节碎片"问题需要合并
//
// 用法: node scripts/probe-minimax-tts.mjs
// 依赖: MINIMAX_API_KEY

const apiKey = process.env.MINIMAX_API_KEY;
if (!apiKey) throw new Error('Missing MINIMAX_API_KEY');

// 1) 先用 sentence 模式探一下,看返回结构
const sampleText = '在川西高原的风里,有一座叫炉霍的地方。';

async function probeSentence() {
  console.log('\n=== 探针 1: sentence 模式 (非流式) ===');
  const resp = await fetch('https://api.minimaxi.com/v1/t2a_v2', {
    method: 'POST',
    headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      model: 'speech-2.8-hd',
      text: sampleText,
      stream: false,
      language_boost: 'Chinese',
      output_format: 'hex',
      voice_setting: {voice_id: 'male-qn-jingying', speed: 1, vol: 1, pitch: 0},
      audio_setting: {sample_rate: 32000, bitrate: 128000, format: 'mp3', channel: 1},
      subtitle_enable: true,
      subtitle_type: 'sentence',
    }),
  });
  const body = await resp.json();
  console.log('top-level keys:', Object.keys(body));
  if (body.data) console.log('data keys:', Object.keys(body.data));
  if (body.extra_info) {
    console.log('extra_info.audio_length:', body.extra_info.audio_length, 'ms');
    console.log('extra_info.usage_characters:', body.extra_info.usage_characters);
  }
  if (body.data?.subtitle_file) {
    console.log('\nsubtitle_file URL:', body.data.subtitle_file);
    const subResp = await fetch(body.data.subtitle_file);
    const subBody = await subResp.json();
    console.log('subtitle entries:', Array.isArray(subBody) ? subBody.length : 'NOT ARRAY');
    console.log('first entry keys:', subBody[0] ? Object.keys(subBody[0]) : 'empty');
    console.log('first entry sample:', JSON.stringify(subBody[0], null, 2));
    if (subBody[1]) {
      console.log('second entry sample:', JSON.stringify(subBody[1], null, 2));
    }
  } else {
    console.log('!! no subtitle_file in response (subtitle_enable may not be honored)');
  }
  console.log('\nbase_resp:', body.base_resp);
  return body;
}

// 2) word_streaming 流式探针
async function probeWordStream() {
  console.log('\n=== 探针 2: word_streaming 模式 (流式) ===');
  const resp = await fetch('https://api.minimaxi.com/v1/t2a_v2', {
    method: 'POST',
    headers: {Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json'},
    body: JSON.stringify({
      model: 'speech-2.8-hd',
      text: sampleText,
      stream: true,
      language_boost: 'Chinese',
      output_format: 'hex',
      voice_setting: {voice_id: 'male-qn-jingying', speed: 1, vol: 1, pitch: 0},
      audio_setting: {sample_rate: 32000, bitrate: 128000, format: 'mp3', channel: 1},
      subtitle_enable: true,
      subtitle_type: 'word_streaming',
    }),
  });
  if (!resp.ok) {
    console.log('!! HTTP', resp.status);
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let chunkCount = 0;
  let status1Count = 0;
  let status2Count = 0;
  let otherStatusCount = 0;
  let firstWordChunk = null;
  let lastWordChunk = null;
  let wordSample = [];
  let totalAudioLenMs = null;
  let firstAudioHexLen = 0;
  let lastAudioHexLen = 0;

  while (true) {
    const {done, value} = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, {stream: true});
    let idx;
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 1);
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const jsonStr = trimmed.slice(5).trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;
      try {
        const evt = JSON.parse(jsonStr);
        chunkCount++;
        const status = evt.data?.status;
        if (status === 1) status1Count++;
        else if (status === 2) status2Count++;
        else otherStatusCount++;
        if (evt.extra_info?.audio_length) totalAudioLenMs = evt.extra_info.audio_length;
        const audioHex = evt.data?.audio;
        if (audioHex) {
          if (firstAudioHexLen === 0) firstAudioHexLen = audioHex.length;
          lastAudioHexLen = audioHex.length;
        }
        const tw = evt.data?.subtitle?.timestamped_words;
        if (Array.isArray(tw)) {
          if (!firstWordChunk) firstWordChunk = tw;
          lastWordChunk = tw;
          if (wordSample.length < 3) wordSample.push({status, words: tw.slice(0, 3)});
        }
      } catch (e) {}
    }
  }

  console.log('total SSE chunks:', chunkCount);
  console.log('  status=1 (intermediate):', status1Count);
  console.log('  status=2 (final):       ', status2Count);
  console.log('  other status:           ', otherStatusCount);
  console.log('audio_length (ms):        ', totalAudioLenMs);
  console.log('first audio hex length:   ', firstAudioHexLen);
  console.log('last  audio hex length:   ', lastAudioHexLen);
  console.log('\nfirst timestamped_words chunk (first 3 words):');
  if (firstWordChunk) {
    firstWordChunk.slice(0, 3).forEach((w) => {
      console.log('  ', JSON.stringify(w));
    });
  }
  console.log('\nlast timestamped_words chunk (first 3 words):');
  if (lastWordChunk) {
    lastWordChunk.slice(0, 3).forEach((w) => {
      console.log('  ', JSON.stringify(w));
    });
  }
  console.log('\nword field sample (status 1):');
  wordSample.forEach((s, i) => console.log(`  [${i}] status=${s.status}:`, JSON.stringify(s.words[0])));

  // 总结
  console.log('\n=== 结论 ===');
  console.log(status2Count === 1
    ? '✓ word_streaming 中文行为类似英文: 1 个 status=2 终态, 多个 status=1 中间态'
    : `!! status=2 数量异常: ${status2Count} (英文场景是 1)`);
  console.log(firstWordChunk && firstWordChunk[0]?.word !== undefined
    ? '✓ timestamped_words 包含 word 字段'
    : '!! timestamped_words 没有 word 字段');
  console.log(firstWordChunk && firstWordChunk[0]?.time_begin !== undefined
    ? '✓ timestamped_words 包含 time_begin 字段 (毫秒)'
    : '!! timestamped_words 没有 time_begin 字段');
}

await probeSentence();
await probeWordStream();
