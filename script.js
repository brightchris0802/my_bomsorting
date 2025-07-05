document.getElementById("analyze").addEventListener("click", () => {
  const inputData = document.getElementById("inputArea").value.trim();
  const resultBody = document.getElementById("resultBody");
  resultBody.innerHTML = "";

  if (!inputData) return;

  const lines = inputData.split("\n");
  const folderMap = {}; // 공용부품 중복 확인용

  lines.forEach(line => {
    if (!line.trim()) return;

    const parts = line.split(/\t+/);
    const topdown = parts[0];
    const path = parts[1];

    const pathParts = path.split(/\\|\//);
    const fileFullName = pathParts[pathParts.length - 1];
    const folderName = pathParts[pathParts.length - 2];
    const folderPath = pathParts.slice(0, pathParts.length - 1).join("/");
    const extension = fileFullName.split(".").pop().toLowerCase();
    const fileName = fileFullName.replace(/\.[^/.]+$/, "");

    let category = "";
    let manufacturer = "";
    let exception = "";

    // 공용부품 중복 확인용 목록 저장
    if (/3[_\/]?공용부품/i.test(folderPath)) {
      if (!folderMap[folderPath]) folderMap[folderPath] = [];
      folderMap[folderPath].push({ topdown, fileFullName, fileName, extension });
    }

    // Part 폴더 내 분류
    if (/2[_\/]?Part/i.test(folderPath)) {
      if (extension === "iam") {
        category = "부품"; // 규칙에 따라 조립품이 아닌 부품으로 처리
      } else if (extension === "ipt") {
        category = "부품";
      } else {
        exception = "ipt/iam 외 확장자";
      }
    }

    // 공용부품 내 분류
    else if (/3[_\/]?공용부품/i.test(folderPath)) {
      const match = fileName.match(/MG\d{2}-([A-Z]\d{2,3})/);
      if (match && match[1].startsWith("E")) {
        category = "기성 PCB";
      } else if (extension === "iam") {
        category = "기성품";
      } else if (extension === "ipt") {
        category = "기성 부품";
      } else {
        exception = "ipt/iam 외 확장자";
      }

      const vendorMatch = folderName.match(/_(\w+)$/);
      if (vendorMatch) manufacturer = vendorMatch[1];
    }

    // 그 외 일반 처리
    else {
      if (extension === "iam") category = "조립품";
      else if (extension === "ipt") category = "부품";
      else exception = "ipt/iam 외 확장자";
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

  // 공용부품 중복 예외처리
  for (const folder in folderMap) {
    const files = folderMap[folder];
    const grouped = files.reduce((acc, file) => {
      acc[file.extension] = acc[file.extension] || [];
      acc[file.extension].push(file);
      return acc;
    }, {});

    if (grouped.iam && grouped.ipt) {
      grouped.ipt.forEach(file => {
        const row = document.querySelector(`tr td:first-child:textContent("${file.topdown}")`).parentElement;
        row.children[5].textContent = "공용부품 중복됨";
      });
    }
  }
});

document.getElementById("reset").addEventListener("click", () => {
  document.getElementById("inputArea").value = "";
  document.getElementById("resultBody").innerHTML = "";
});