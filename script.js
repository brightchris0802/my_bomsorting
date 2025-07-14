document.getElementById("analyzeBtn").addEventListener("click", () => {
  const inputText = document.getElementById("inputArea").value.trim();
  const lines = inputText.split("\n");
  const resultBody = document.getElementById("resultBody");
  resultBody.innerHTML = "";

  lines.forEach(line => {
    if (!line.trim()) return;

    const parts = line.split(/\t+/);
    if (parts.length < 2) return;

    const topdown = parts[0];
    const path = parts[1];

    const pathParts = path.split(/\\|\//);
    const fileFullName = pathParts[pathParts.length - 1];
    const folderName = pathParts[pathParts.length - 2];
    const extension = fileFullName.split(".").pop().toLowerCase();
    const fileName = fileFullName.replace(/\.[^/.]+$/, "");

    let category = "";
    let manufacturer = "";
    let exception = "";

    // 예외 확장자
    if (!["ipt", "iam"].includes(extension)) {
      exception = "ipt/iam 외 확장자";
    }

    // 제조사 추출
    const vendorMatch = folderName.match(/_([A-Za-z0-9\-]+)$/);
    if (vendorMatch) manufacturer = vendorMatch[1];

    // 출력
    resultBody.innerHTML += `
      <tr>
        <td>${topdown}</td>
        <td>${fileName}</td>
        <td>${manufacturer}</td>
        <td>${path}</td>
        <td>${exception}</td>
      </tr>
    `;
  });
});

document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("inputArea").value = "";
  document.getElementById("resultBody").innerHTML = "";
});