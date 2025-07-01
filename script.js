function analyze() {
  const input = document.getElementById('inputArea').value.trim();
  const rows = input.split('\n');
  const tbody = document.querySelector('#resultTable tbody');
  tbody.innerHTML = '';

  rows.forEach(line => {
    const [filename, path] = line.split('\t');
    if (!filename || !path) return;

    const extension = filename.includes('.') ? filename.split('.').pop() : '';
    const parts = filename.split('_');
    const result = {
      number: '',
      name: '',
      extension,
      path,
      type: '',
      error: ''
    };

    // 도면번호와 명칭 파싱
    if (parts.length >= 2 && parts[0].includes('-')) {
      result.number = parts[0];
      result.name = parts.slice(1).join('_').replace(`.${extension}`, '');
    } else if (parts.length >= 3) {
      result.type = '기성품';
      result.name = parts[1];
    } else {
      result.error = '파일명 형식 오류';
    }

    // 분류
    if (result.type !== '기성품') {
      if ((path.includes('2_Part') || path.includes('02_Part')) && extension === 'ipt') {
        result.type = '부품';
      } else if (path.includes('3D') && extension === 'iam') {
        result.type = '조립품';
      } else if ((path.includes('3_공용부품') || path.includes('03_공용부품'))) {
        result.type = '기성품';
      } else if ((path.includes('2_Part') || path.includes('02_Part')) && extension === 'iam') {
        result.type = '판별불가';
        result.error = '판넬 또는 프로파일 판단 필요';
      } else {
        result.type = '미분류';
      }
    }

    const tr = document.createElement('tr');
    tr.className = result.error
      ? (result.error.includes('판넬') ? 'unknown' : 'warn')
      : '';

    tr.innerHTML = `
      <td>${result.number}</td>
      <td>${result.name}</td>
      <td>${result.extension}</td>
      <td>${result.path}</td>
      <td>${result.type}</td>
      <td>${result.error}</td>
    `;

    tbody.appendChild(tr);
  });
}