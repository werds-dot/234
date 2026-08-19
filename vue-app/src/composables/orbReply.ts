/**
 * Composes the orb's spoken reply to a user message. There is no backend for
 * this demo, so replies are generated locally from lightweight intent
 * heuristics (greeting / question / thanks / statement) plus a deterministic
 * pick, so the same input always yields the same reply.
 */
export function composeOrbReply(input: string): string {
  const text = input.trim()
  if (!text) return '我在听，说点什么吧。'

  const quoted = `「${text.length > 20 ? `${text.slice(0, 20)}…` : text}」`
  const lower = text.toLowerCase()

  if (/^(你好|您好|哈喽|嗨|hi|hello|hey)/.test(lower)) {
    return '你好，我是液态磁体。对我说话或打字，我会随声音起伏并回应你。'
  }
  if (/(谢谢|感谢|多谢|thanks|thank you)/.test(lower)) {
    return '不客气，我一直都在这里。'
  }
  if (/(再见|拜拜|晚安|bye|goodbye)/.test(lower)) {
    return '好的，随时回来找我。'
  }
  if (/[?？]$/.test(text) || /(吗|呢|怎么|如何|为什么|为何|什么|哪|是否|能不能|可不可以)/.test(text)) {
    const answers = [
      `关于${quoted}，我的理解是：这取决于你想达成的目标。再多给我一点细节，我能回应得更准。`,
      `${quoted}是个好问题。可以先把它拆成更小的部分，我们一步步来。`,
      `就${quoted}而言，通常没有唯一答案——告诉我你的场景，我帮你缩小范围。`,
    ]
    return answers[hashIndex(text, answers.length)]
  }

  const acks = [
    `收到，你提到了${quoted}。我已经记下来，会围绕它继续和你聊。`,
    `明白了——${quoted}。我随你的语气一起起伏，你可以接着往下说。`,
    `我听到了${quoted}。想让我展开哪一部分？`,
  ]
  return acks[hashIndex(text, acks.length)]
}

/** Small stable string hash so a given input maps to a fixed reply variant. */
function hashIndex(str: string, mod: number): number {
  let hash = 0
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % mod
}
