function analyzeData() {
  const input = document.getElementById("inputData").value;
  const lines = input.split("\n");
  const resultBody = document.querySelector("#outputTable tbody");
  resultBody.innerHTML = "";

  const folderMap = {};

  lines.forEach(line => {
    if (!line.trim()) return;
    const [topdown, path] = line.split(/\t+/);
    if (!topdown || !path) return;

    const pathParts = path.split(/[\\/]/); // 이 줄만 바꿔주세요
    const fileFullName = pathParts[pathParts.length - 1];
    const folderName = pathParts[pathParts.length - 2];
    const folderPath = pathParts.slice(0, pathParts.length - 1).join("/");
    const extension = fileFullName.split(".").pop().toLowerCase();
    const fileName = fileFullName.replace(/\.[^/.]+$/, "");

    let category = "";
    let manufacturer = "";
    let exception = "";

    // 기본 분류 로직
    if (/3[_\/]?공용부품/i.test(folderPath)) {
      if (!folderMap[folderPath]) folderMap[folderPath] = [];
      folderMap[folderPath].push({ topdown, fileFullName, fileName, extension });
    }

    // 기본 분류
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
      if (vendorMatch) manufacturer = vendorMatch[1];
    } else {
      if (extension === "iam") category = "조립품";
      else if (extension === "ipt") category = "부품";
    }

    resultBody.innerHTML += `
      <tr>
        <td>${topdown}</td>
        <td>${fileName}</td>
        <td>${fileName}</td>
        <td>${category}</td>
        <td>${manufacturer}</td>
        <td>${exception}</td>
      </tr>
    `;
  });

  // 예외 처리: 공용부품 중복
  for (const folder in folderMap) {
    const files = folderMap[folder];
    const nameMap = {};
    files.forEach(file => {
      if (!nameMap[file.fileName]) nameMap[file.fileName] = [];
      nameMap[file.fileName].push(file);
    });
    for (const name in nameMap) {
      const group = nameMap[name];
      if (group.length > 1) {
        const hasIAM = group.find(f => f.extension === "iam");
        const hasIPT = group.find(f => f.extension === "ipt");
        if (hasIAM && hasIPT) {
          const row = Array.from(resultBody.rows).find(r => r.cells[1].textContent === name && r.cells[3].textContent === "부품");
          if (row) row.cells[5].textContent = "공용부품 중복됨";
        }
      }
    }
  }
}

function clearData() {
  document.getElementById("inputData").value = "";
  document.querySelector("#outputTable tbody").innerHTML = "";
}