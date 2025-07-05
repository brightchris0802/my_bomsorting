document.getElementById("analyze-button").addEventListener("click", () => {
  const input = document.getElementById("input-data").value.trim();
  const resultBody = document.getElementById("result-body");
  resultBody.innerHTML = ""; // 결과 초기화

  const lines = input.split("\n");
  const folderMap = {};

  lines.forEach(line => {
    if (!line.trim()) return;

    const parts = line.split(/\t+/);
    const topdown = parts[0];
    const path = parts[1];
    if (!topdown || !path) return;

    const pathParts = path.split(/\\|\/+/);
    const fileFullName = pathParts[pathParts.length - 1];
    const folderName = pathParts[pathParts.length - 2];
    const folderPath = pathParts.slice(0, pathParts.length - 1).join("/");
    const extension = fileFullName.split(".").pop().toLowerCase();
    const fileName = fileFullName.replace(/\.[^/.]+$/, "");

    let category = "";
    let manufacturer = "";
    let exception = "";

    // 공용부품 폴더 처리용 map에 저장
    if (/3[_\/]?공용부품/i.test(folderPath)) {
      if (!folderMap[folderPath]) folderMap[folderPath] = [];
      folderMap[folderPath].push({ topdown, fileFullName, fileName, extension });
    }

    // 분류 기준 적용
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

    // 도면번호 / 도면명 구분
    const drawingNo = fileName.split("_")[0];
    const drawingName = fileName.replace(drawingNo + "_", "");

    // 예외 처리: ipt인데 조립품인 경우
    if (extension === "ipt" && fileName.includes("assy")) {
      exception = "ipt 확장자는 조립품 불가";
    }

    resultBody.innerHTML += `
      <tr>
        <td>${topdown}</td>
        <td>${drawingNo}</td>
        <td>${drawingName}</td>
        <td>${category}</td>
        <td>${manufacturer}</td>
        <td>${exception}</td>
      </tr>
    `;
  });

  // 공용부품 예외 검사: 중복된 ipt/iam
  for (const folderPath in folderMap) {
    const files = folderMap[folderPath];
    const iamFiles = files.filter(f => f.extension === "iam");
    const iptFiles = files.filter(f => f.extension === "ipt");

    if (iamFiles.length && iptFiles.length) {
      iptFiles.forEach(f => {
        const row = [...resultBody.rows].find(r => r.cells[0].textContent === f.topdown);
        if (row) row.cells[5].textContent = "공용부품 중복됨";
      });
    }
  }
});

// 초기화 버튼
document.getElementById("reset-button").addEventListener("click", () => {
  document.getElementById("input-data").value = "";
  document.getElementById("result-body").innerHTML = "";
});