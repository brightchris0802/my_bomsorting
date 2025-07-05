document.getElementById("analyzeBtn").addEventListener("click", () => {
  const input = document.getElementById("inputData").value.trim();
  const resultBody = document.getElementById("resultBody");
  resultBody.innerHTML = "";

  const lines = input.split("\n");
  const folderMap = {};

  lines.forEach(line => {
    if (!line.trim()) return;

    const [topdown, path] = line.split(/\t+/);
    if (!topdown || !path) return;

    const pathParts = path.split(/\\|\\//);
    const fileFullName = pathParts[pathParts.length - 1];
    const folderName = pathParts[pathParts.length - 2];
    const folderPath = pathParts.slice(0, pathParts.length - 1).join("/");
    const extension = fileFullName.split(".").pop().toLowerCase();
    const fileName = fileFullName.replace(/\.[^/.]+$/, "");

    let drawingNumber = "";
    let drawingName = "";
    let category = "";
    let manufacturer = "";
    let exception = "";

    // 도면번호, 도면명 분리
    const underscoreIndex = fileName.indexOf("_");
    if (underscoreIndex !== -1) {
      drawingNumber = fileName.substring(0, underscoreIndex);
      drawingName = fileName.substring(underscoreIndex + 1);
    } else {
      drawingNumber = fileName;
      drawingName = "";
    }

    // 공용부품 사전 처리용 폴더 수집
    if (/3[_\/]?공용부품/i.test(folderPath)) {
      if (!folderMap[folderPath]) folderMap[folderPath] = [];
      folderMap[folderPath].push({ topdown, fileFullName, fileName, extension });
    }

    // 분류 기준
    if (/2[_\/]?Part/i.test(folderPath)) {
      if (extension === "iam") {
        category = "조립품";
      } else if (extension === "ipt") {
        category = "부품";
      } else {
        exception = "ipt/iam 외 확장자";
      }
    } else if (/3[_\/]?공용부품/i.test(folderPath)) {
      const match = fileName.match(/MG\d{2}-([A-Z]\d{2,3})/);
      if (match && match[1].startsWith("E")) {
        category = "기성 PCB";
      } else if (extension === "iam") {
        category = "기성품";
      } else {
        category = "기성 부품";
      }

      const vendorMatch = folderName.match(/_(\w+)$/);
      if (vendorMatch) {
        manufacturer = vendorMatch[1];
      }
    } else {
      if (extension === "iam") category = "조립품";
      else if (extension === "ipt") category = "부품";
    }

    resultBody.innerHTML += `
      <tr>
        <td>${topdown}</td>
        <td>${drawingNumber}</td>
        <td>${drawingName}</td>
        <td>${category}</td>
        <td>${manufacturer}</td>
        <td>${exception}</td>
      </tr>
    `;
  });
});

// 초기화 버튼
document.getElementById("resetBtn").addEventListener("click", () => {
  document.getElementById("inputData").value = "";
  document.getElementById("resultBody").innerHTML = "";
});