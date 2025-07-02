function resetAll() {
  document.getElementById('inputArea').value = '';
  document.querySelector('#resultTable tbody').innerHTML = '';
}

function analyze() {
  const input = document.getElementById('inputArea').value.trim();
  const lines = input.split('\n');
  const entries = lines.map(line => {
    const [filename, path] = line.split(/\t|\s{2,}/);
    return { filename, path };
  });

  const iamIptPairs = {};
  entries.forEach(entry => {
    const name = entry.filename.replace(/\.(iam|ipt)$/i, '');
    const ext = entry.filename.split('.').pop().toLowerCase();
    const isIn2Part = /(?:^|\\)(?:2_Part|02_Part)(?:\\|$)/i.test(entry.path);
    if (isIn2Part) {
      if (!iamIptPairs[name]) iamIptPairs[name] = {};
      iamIptPairs[name][ext] = true;
    }
  });

  const tbody = document.querySelector('#resultTable tbody');
  tbody.innerHTML = '';

  entries.forEach(entry => {
    const ext = entry.filename.split('.').pop().toLowerCase();
    const name = entry.filename.replace(/\.(iam|ipt)$/i, '');
    const path = entry.path;
    let type = '';
    let code = '';
    let namePart = '';
    let vendor = '';
    let exception = '';

    const is2Part = /(?:^|\\)(?:2_Part|02_Part)(?:\\|$)/i.test(path);
    const is3D = /(?:^|\\)3D(?:\\|$)/i.test(path);
    const isStandard = /(?:^|\\)(?:3_공용부품|03_공용부품)(?:\\|$)/i.test(path);

    if (isStandard && entry.filename.includes('_')) {
      const parts = entry.filename.replace(/\.(iam|ipt)$/i, '').split('_');
      if (parts.length >= 3) {
        type = '기성품';
        code = parts[0];
        namePart = parts[1];
        vendor = parts.slice(2).join('_');
      } else {
        type = '기성품';
        exception = '형식 오류';
      }
    } else if (is2Part) {
      if (iamIptPairs[name]?.iam && iamIptPairs[name]?.ipt) {
        type = ext === 'iam' ? '판넬' : '판넬서브';
      } else {
        type = '부품'; // 새 규칙에 따라 .iam도 부품 처리
      }
    } else if (is3D && ext === 'iam') {
      type = '조립품';
    } else {
      exception = '분류불가';
    }

    if (!type) type = '미분류';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${code || name}</td>
      <td>${namePart || (name.includes('_') ? name.split('_').slice(1).join('_') : '')}</td>
      <td>${ext}</td>
      <td>${path}</td>
      <td>${type}</td>
      <td>${vendor}</td>
      <td>${exception}</td>
    `;
    tbody.appendChild(tr);
  });
}