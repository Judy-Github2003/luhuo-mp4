// scripts/probe-key.mjs
// 用新 key 测 MiniMax API 是否有效 + 余额
// 1) 先 TTS 试活 (成本约 0.0001 元, 极便宜, 返回 200 = key 有效)
// 2) 如果 200, 再列一下剩余额度 (MiniMax 没有公开 query_credit 接口, 我们只能试探)

const API_KEY = "sk-api-j2Npc_OMInqE7_G8QFcUJXCR69HCYBO5DuUs8XPt5V2MKfJTduZ2gFqZbVF4So3GXc-XslVgRxNkSPFzlaXJRRVYg1MOgKd00nvQDaoJ6HQ9W2cCGD07GQg";

const url = "https://api.minimaxi.com/v1/t2a_v2";

// 用最短的中文 (1 个字) 测, 消耗几乎 0
const body = {
  model: "speech-2.8-hd",
  text: "测",
  stream: false,
  language_boost: "Chinese",
  output_format: "hex",
  voice_setting: { voice_id: "male-qn-jingying", speed: 1, vol: 1, pitch: 0 },
  audio_setting: { sample_rate: 32000, bitrate: 128000, format: "mp3", channel: 1 },
};

console.log("Probing MiniMax T2A v2 with new key...");
console.log("Endpoint:", url);
console.log("Text:    1 char (test)");

try {
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const httpStatus = resp.status;
  const respBody = await resp.json();

  console.log(`\nHTTP Status: ${httpStatus}`);
  console.log("Response keys:", Object.keys(respBody));

  if (respBody.base_resp) {
    console.log("base_resp:", respBody.base_resp);
  }

  // 成功
  if (httpStatus === 200 && respBody.base_resp?.status_code === 0 && respBody.data?.audio) {
    const audioBytes = Buffer.from(respBody.data.audio, "hex");
    console.log(`\n✓ Key is VALID. Audio received: ${audioBytes.length} bytes`);
    if (respBody.extra_info) {
      console.log("extra_info:", {
        audio_length: respBody.extra_info.audio_length,
        usage_characters: respBody.extra_info.usage_characters,
      });
    }
  }
  // 余额不足
  else if (httpStatus === 402 || respBody.base_resp?.status_code === 1004 || respBody.base_resp?.status_code === 1002) {
    console.log(`\n✗ Key is VALID but NO QUOTA. Code: ${httpStatus} / ${respBody.base_resp?.status_msg}`);
  }
  // key 错误
  else if (httpStatus === 401 || httpStatus === 403) {
    console.log(`\n✗ Key is INVALID. Code: ${httpStatus} / ${respBody.base_resp?.status_msg}`);
  }
  // 其它
  else {
    console.log("\n? Unexpected response:", respBody);
  }
} catch (e) {
  console.error("Network/proxy error:", e.message);
}
