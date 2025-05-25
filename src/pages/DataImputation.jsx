// src/pages/DataImputation.jsx
import React, { useState, useEffect, useRef } from 'react';
import './DataImputation.css';

export default function DataImputation() {
  const [serverUrl, setServerUrl] = useState('');
  const [health, setHealth]       = useState({
    status: 'checking',
    message: '서버 상태를 확인 중입니다…'
  });
  const [file,    setFile]        = useState(null);
  const [loading, setLoading]     = useState(false);
  const [results, setResults]     = useState(null);
  const [error,   setError]       = useState('');
  const fileInputRef              = useRef();

  // 서버 상태 체크
  const checkHealth = async () => {
    setHealth({ status: 'checking', message: '서버 연결을 확인하는 중…' });
    try {
      const res = await fetch(`${serverUrl}/`, {
        headers: { 'ngrok-skip-browser-warning': 'true' }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHealth({ status: 'online', message: '서버 연결됨' });
    } catch (err) {
      setHealth({ status: 'offline', message: `서버 연결 실패 • ${err.message}` });
    }
  };

  // 파일 선택 핸들러
  const handleFileSelect = e => {
    setError('');
    setResults(null);
    const f = e.target.files[0];
    if (!f) {
      setFile(null);
      return;
    }
    if (f.type !== 'text/csv' && !f.name.endsWith('.csv')) {
      setError('CSV 파일(.csv)만 업로드 가능합니다.');
      setFile(null);
      return;
    }
    setFile(f);
  };

  // 업로드 & 예측
  const uploadAndPredict = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${serverUrl}/predict`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: formData
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || '알 수 없는 오류 발생');
      setResults(json);
    } catch (err) {
      setError(`❌ 오류: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 서버 URL이 변경되면 자동으로 health 체크
  useEffect(() => {
    if (serverUrl) checkHealth();
    else setHealth({ status: 'checking', message: '서버 URL을 입력하세요' });
  }, [serverUrl]);

  return (
    <div className="container">
      <div className="header">
        <h1>AI 데이터 보정</h1>
        <p>머신러닝으로 데이터를 보정하고 이상치를 탐지해보세요</p>
      </div>

      {/* 서버 연결 상태 */}
      <div className="card">
        <div className="card-title">서버 연결 상태</div>
        <div className="input-group">
          <label className="input-label" htmlFor="serverUrl">서버 URL</label>
          <input
            id="serverUrl"
            className="input-field"
            type="text"
            value={serverUrl}
            placeholder="https://xxxxx.ngrok-free.app"
            onChange={e => setServerUrl(e.target.value.replace(/\/$/, ''))}
          />
        </div>
        <button
          className="btn btn-secondary"
          onClick={checkHealth}
          disabled={!serverUrl || health.status === 'checking'}
        >
          연결 확인
        </button>
        <div className={`status-indicator ${health.status}`}>
          <div className={`status-dot ${health.status}`}></div>
          {health.message}
        </div>
      </div>

      {/* 파일 업로드 */}
      <div className="card">
        <div className="card-title">CSV 파일 업로드</div>
        <div className="input-group">
          <label
            className={`file-upload ${file ? 'has-file' : ''}`}
            htmlFor="csvFile"
          >
            <input
              ref={fileInputRef}
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
            />
            <div className="file-icon">📄</div>
            <div className="file-upload-text">
              {file
                ? `${file.name} (${(file.size / 1024).toFixed(1)}KB)`
                : 'CSV 파일을 선택하거나 드래그하세요'}
            </div>
          </label>
        </div>

        <div className="btn-group">
          <button
            className="btn btn-primary"
            onClick={uploadAndPredict}
            disabled={!file || loading || health.status !== 'online'}
          >
            {loading
              ? '처리 중…'
              : file
                ? '데이터 보정 시작'
                : '파일을 선택해주세요'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className={`loading ${loading ? 'show' : ''}`}>
          <div className="spinner"></div>
          <div className="loading-text">AI가 데이터를 분석하고 있어요</div>
        </div>

        {results && (
          <div className="results">
            <div className="results-header">
              <div className="success-icon">✓</div>
              <div className="results-title">{results.message}</div>
            </div>
           

            <div className="preview-label">📊 보정된 데이터 미리보기</div>
            <div className="data-preview">
              <pre>
                {JSON.stringify(
                  results.data.imputed_data.slice(0, 2).map(row => row.slice(0, 8)),
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="btn-group">
              <button
                className="btn btn-primary"
                onClick={() => {
                  const imputed = results.data.imputed_data;
                  let csv = 'data:text/csv;charset=utf-8,';
                  csv +=
                    Array.from({ length: imputed[0].length }, (_, i) => `col_${i}`)
                      .join(',') + '\n';
                  imputed.forEach(r => (csv += r.join(',') + '\n'));
                  const link = document.createElement('a');
                  link.href = encodeURI(csv);
                  link.download = `corrected_${Date.now()}.csv`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
              >
                💾 결과 다운로드
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  fileInputRef.current.value = '';
                  setFile(null);
                  setResults(null);
                  setError('');
                }}
              >
                🔄 새로 시작
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
