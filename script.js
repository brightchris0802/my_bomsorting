function analyze() {
    const input = document.getElementById('inputArea').value.trim();
    const rows = input.split('\n');
    const tbody = document.getElementById('resultTable').querySelector('tbody');
    tbody.innerHTML = '';
  
    rows.forEach(line => {
      const [fullName, path] = line.split(/\t+/);
      const row = document.createElement('tr');
  
      let drawingNum = '', drawingName = '', ext = '', category = '', exception = '';
      let cssClass = '';
  
      if (!fullName || !path) {
        exception = '입력 구조 오류';
        cssClass = 'error';
      } else {
        const dotIndex = fullName.lastIndexOf('.');
        if (dotIndex === -1) {
          exception = '확장자 없음';
          cssClass = 'error';
        } else {
          ext = fullName.substring(dotIndex + 1);
          const nameOnly = fullName.substring(0, dotIndex);
          if (nameOnly.includes('_')) {
            const parts = nameOnly.split('_');
            if (parts.length === 2) {
              drawingNum = parts[0];
              drawingName = parts[1];
            } else if (parts.length === 3) {
              drawingNum = parts[0];
              drawingName = parts[1];
              category = '기성품';
            } else {
              drawingNum = nameOnly;
              exception = '도면명칭 형식 오류';
              cssClass = 'warn';
            }
          }
  
          const lowerPath = path.toLowerCase();
          if (!category) {
            if (['ipt', 'iam'].includes(ext)) {
              if (lowerPath.includes('3_공용부품') || lowerPath.includes('03_공용부품')) {
                category = '기성품';
              } else if (lowerPath.includes('3d') && ext === 'iam') {
                category = '조립품';
              } else if ((lowerPath.includes('2_part') || lowerPath.includes('02_part')) && ext === 'ipt') {
                category = '부품';
              } else if ((lowerPath.includes('2_part') || lowerPath.includes('02_part')) && ext === 'iam') {
                category = '판별불가';
                exception = '판넬/프로파일 판별불가';
                cssClass = 'unknown';
              } else {
                category = '미분류';
                exception = '경로 조건 불일치';
                cssClass = 'warn';
              }
            } else {
              category = '미분류';
              exception = '확장자 오류';
              cssClass = 'error';
            }
          }
        }
      }
  
      [drawingNum, drawingName, ext, path, category, exception].forEach(txt => {
        const td = document.createElement('td');
        td.textContent = txt;
        row.appendChild(td);
      });
      if (cssClass) row.classList.add(cssClass);
      tbody.appendChild(row);
    });
  }