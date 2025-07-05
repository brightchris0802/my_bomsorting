function resetAll() {
  document.getElementById('inputArea').value = '';
  document.querySelector('#resultTable tbody').innerHTML = '';
}

function analyze() {
  const input = document.getElementById('inputArea').value.trim();
  const lines = input.split('\n');
  const entries = lines.map(line => {
    const cleanLine = line.trim();
    const match = cleanLine.match(/^(.*[\\/])([^\\/]+)$/);
    if (match) {
      return {
        path: match[1].replace(/[\\/]+$/, ''),
        filename: match[2]
      };
    } else {
      return { filename: '', path: '' };
    }
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

    if (!entry.filename || !entry.path) {
      exception = '파일명 또는 경로가 누락되어 분석할 수 없습니다.';
    } else if (ext === 'ipt' && is3D) {
      exception = 'ipt 파일은 조립품으로 분류할 수 없습니다.';
    } else if (isStandard && entry.filename.includes('_')) {
      const parts = entry.filename.replace(/\.(iam|ipt)$/i, '').split('_');
      if (parts.length >= 2) {
        const codeMatch = parts[0].match(/^([A-Za-z0-9]{4})-(E\d{2,3})$/);
        if (codeMatch) {
          type = '기성 PCB';
          code = parts[0];
          namePart = parts[1];
          vendor = parts.slice(2).join('_') || '-';
        } else {
          type = '기성품';
          code = parts[0];
          namePart = parts[1];
          vendor = parts.slice(2).join('_') || '-';
        }
      } else {
        exception = '기성품은 "제품군_제품명_제조사" 형식을 따라야 합니다.';
      }
    } else if (is2Part) {
      if (iamIptPairs[name]?.iam && iamIptPairs[name]?.ipt) {
        type = ext === 'iam' ? '판넬' : '판넬서브';
      } else {
        type = '부품';
      }
    } else if (is3D && ext === 'iam') {
      type = '조립품';
    } else {
      exception = '해당 파일은 분류 기준에 맞지 않습니다.';
    }

    if (!type && !exception) {
      exception = '분류할 수 없는 형식입니다.';
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${code || name}</td>
      <td>${namePart || (name.includes('_') ? name.split('_').slice(1).join('_') : '')}</td>
      <td>${ext}</td>
      <td>${path}</td>
      <td>${type || '-'}</td>
      <td>${vendor}</td>
      <td>${exception}</td>
    `;
    tbody.appendChild(tr);
  });
}