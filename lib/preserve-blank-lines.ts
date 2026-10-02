// 빈 <p></p>는 높이가 0이고 마진이 겹쳐 연속 엔터가 한 줄로 보인다.
// 저장·렌더 전에 <br>을 넣어 입력한 빈 줄 수를 유지한다.
export function preserveBlankLines(html: string): string {
  if (!html) return ""

  return html.replace(/<p(\s[^>]*)?>\s*(?:<br[^>]*>\s*)?<\/p>/gi, (_match, attrs = "") => {
    return `<p${attrs}><br></p>`
  })
}
