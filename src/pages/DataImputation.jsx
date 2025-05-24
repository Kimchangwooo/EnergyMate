// src/pages/DataImputation.jsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function DataImputation() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  // 로그인 체크
  useEffect(() => {
    if (!localStorage.getItem('accessToken')) {
      window.location.href = '/login'
    }
  }, [])

  const handleFileChange = (e) => {
    setError('')
    setResult(null)
    const f = e.target.files[0]
    if (f && f.type !== 'text/csv') {
      setError('CSV 파일(.csv)만 업로드 가능합니다.')
      setFile(null)
      return
    }
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('file', file)

      // TODO: 실제 백엔드 URL로 교체
      const res = await axios.post(
        'https://your-backend.com/api/impute',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      setResult(res.data) // 서버가 반환한 처리 결과를 저장
    } catch (err) {
      console.error(err)
      setError('업로드에 실패했습니다.')
    } finally {
      setUploading(false)
    }
  }

  // 인라인 스타일 객체
  const styles = {
    container: {
      padding: 32,
      background: '#F4F7FE',
      minHeight: '100vh',
      fontFamily: 'system-ui, sans-serif',
      color: '#2B3674',
    },
    box: {
      background: 'white',
      borderRadius: 20,
      padding: 24,
      maxWidth: 500,
      marginBottom: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    header: {
      margin: 0,
      marginBottom: 16,
      fontSize: '1.5rem',
    },
    input: {
      width: '100%',
      padding: 8,
      fontSize: '1rem',
      borderRadius: 6,
      border: '1px solid #ccc',
    },
    button: {
      marginTop: 12,
      padding: '10px 16px',
      fontSize: '1rem',
      border: '2px solid #2B3674',
      backgroundColor: '#2B3674',
      color: 'white',
      borderRadius: 6,
      cursor: uploading ? 'not-allowed' : 'pointer',
      opacity: uploading ? 0.6 : 1,
    },
    fileName: {
      marginTop: 8,
      fontSize: '0.9rem',
      color: '#2B3674',
    },
    error: {
      marginTop: 8,
      fontSize: '0.9rem',
      color: '#e03e2d',
    },
    resultBox: {
      background: 'white',
      borderRadius: 20,
      padding: 24,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>결측치 데이터 보정</h2>

      <div style={styles.box}>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={uploading}
          style={styles.input}
        />
        {file && <div style={styles.fileName}>선택된 파일: {file.name}</div>}
        {error && <div style={styles.error}>{error}</div>}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          style={styles.button}
        >
          {uploading ? '업로드 중…' : '업로드'}
        </button>
      </div>

      {result && (
        <div style={styles.resultBox}>
          <h3>처리 결과</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
          {/* TODO: 그래프 컴포넌트로 시각화 */}
        </div>
      )}
    </div>
  )
}
