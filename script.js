document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const clearBtn = document.getElementById("clearBtn");
  const inputArea = document.getElementById("inputArea");
  const resultArea = document.getElementById("resultArea");

  analyzeBtn.addEventListener("click", () => {
    const rawLines = inputArea.value.split("\n").map(line => line.trim()).filter(line => line);
    const results = [];

    rawLines.forEach(line => {
      const tabSplit = line.split("\t");
      const [topdown, path] = tabSplit.length === 2 ? tabSplit : [null, tabSplit[0]];

      if (!path) return;

      const fileName = path.split("\\").pop();
      const ext = fileName.split(".").pop().toLowerCase();
      const baseName = fileName.replace(/\.[^/.]+$/, "");
      const folders = path.split("\\");
      const folderName = folders[folders.length - 2] || "";
      const isIn3D = path.toLowerCase().includes("\\2_3d\\");
      const isPart = /\\(02_|2_)part\\/i.test(path);
      const isCommon = /\\(03_|3_)공용부품\\/i.test(path);
      const folderKey = folders.slice(0, -1).join("\\");

      let category = "-";
      let exception = "-";
      let productGroup = "-";
      let maker = "-";

      // 확장자 필터링
      if (!["ipt", "iam"].includes(ext)) {
        exception = "지원되지 않는 확장자";
        results.push([topdown || "-", fileName, "-", "-", "-", "-", "-", exception]);
        return;
      }

      // 전자보드 (기성 PCB)
      const matchCode = baseName.match(/MG\d{2}-E\d{2,3}/i);
      if (isCommon && matchCode) {
        category = "기성 PCB";
        productGroup = matchCode[0];
      }

      // 공용부품 처리
      if (isCommon && category === "-") {
        const siblings = rawLines.filter(l => l.includes(folderKey + "\\"));
        const filesInFolder = siblings.map(l => l.split("\\").pop());
        const extensions = new Set(filesInFolder.map(name => name.split(".").pop().toLowerCase()));
        const hasConflict = extensions.size > 1;

        const nameMatchCount = filesInFolder.filter(n => n.replace(/\.[^/.]+$/, "") === folderName).length;

        if (hasConflict) {
          exception = "공용부품 중복됨";
        } else if (nameMatchCount >= 1 && baseName === folderName) {
          category = ext === "iam" ? "조립부품" : "부품";
        } else {
          exception = "폴더명과 일치 없음";
        }
      }

      // Part 처리
      if (isPart && category === "-") {
        if (ext === "iam") {
          const parentFolder = folders[folders.length - 2].toLowerCase();
          const fileFolder = folders[folders.length - 1].toLowerCase();

          if (parentFolder !== "profile" && baseName.toLowerCase().includes("profile")) {
            category = "프로파일";
          } else if (baseName.toLowerCase().includes("panel")) {
            category = "판넬";
          } else {
            category = "부품"; // 조립품이지만 Part 내면 부품 처리
          }
        } else if (ext === "ipt") {
          if (baseName.toLowerCase().includes("panel")) {
            category = "판넬서브";
          } else {
            category = "부품";
          }
        }
      }

      if (category === "-") exception = "분류불가";

      results.push([
        topdown || "-",
        fileName,
        category,
        ext.toUpperCase(),
        productGroup,
        maker,
        path,
        exception
      ]);
    });

    renderTable(results);
  });

  clearBtn.addEventListener("click", () => {
    inputArea.value = "";
    resultArea.innerHTML = "";
  });

  function renderTable(data) {
    const headers = ["탑다운", "파일명", "분류", "확장자", "제품군", "제조사", "경로", "예외"];
    let html = "<table class='output-table'><thead><tr>";

    headers.forEach(h => html += `<th>${h}</th>`);
    html += "</tr></thead><tbody>";

    data.forEach(row => {
      html += "<tr>";
      row.forEach(col => html += `<td>${col}</td>`);
      html += "</tr>";
    });

    html += "</tbody></table>";
    resultArea.innerHTML = html;
  }
});