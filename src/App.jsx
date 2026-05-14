import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [speed, setSpeed] = useState(0)
  const [isTransferring, setIsTransferring] = useState(false)
  const [turboActive, setTurboActive] = useState(false)
  const [transferAmount, setTransferAmount] = useState('')
  const [lastTransfers, setLastTransfers] = useState([])
  const [message, setMessage] = useState('LISTO PARA TRANSFERIR')
  const [carPosition, setCarPosition] = useState(20)
  const [roadOffset, setRoadOffset] = useState(0)
  const [isFraud, setIsFraud] = useState(false)
  const [crashed, setCrashed] = useState(false)
  const [showHole, setShowHole] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [holeData, setHoleData] = useState({ bank: '', beneficiary: '' })
  const [selectedBank, setSelectedBank] = useState('chase')
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('juan')
  const [exhaustParticles, setExhaustParticles] = useState([])
  
  const roadRef = useRef(null)
  const animationRef = useRef(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (speed > 0) {
        setRoadOffset(prev => (prev - speed * 0.3) % 100)
      }
    }, 50)
    return () => clearInterval(interval)
  }, [speed])

  useEffect(() => {
    if (speed < 15 && carPosition > 15) {
      const slowDown = setInterval(() => {
        setCarPosition(prev => {
          const newPos = prev - 0.5
          return newPos < 15 ? 15 : newPos
        })
      }, 50)
      return () => clearInterval(slowDown)
    }
  }, [speed, carPosition])

  useEffect(() => {
    if (speed > 50 && !isTransferring) {
      const interval = setInterval(() => {
        const newParticle = {
          id: Date.now(),
          x: 10 + Math.random() * 10,
          y: 90 + Math.random() * 5,
        }
        setExhaustParticles(prev => [...prev.slice(-10), newParticle])
        setTimeout(() => {
          setExhaustParticles(prev => prev.filter(p => p.id !== newParticle.id))
        }, 300)
      }, 100)
      return () => clearInterval(interval)
    }
  }, [speed, isTransferring])

  const handleTransfer = () => {
    const amount = parseFloat(transferAmount)
    if (!amount || amount <= 0) {
      setMessage('INGRESA UN MONTO VÁLIDO')
      return
    }

    setIsTransferring(true)
    setMessage('TRANSFIRIENDO...')
    
    const isFraudAmount = amount > 1000
    setIsFraud(isFraudAmount)

    const newTransfer = { amount, isFraud: isFraudAmount, timestamp: Date.now() }
    const updatedHistory = [...lastTransfers, newTransfer].slice(-5)
    setLastTransfers(updatedHistory)

    setTimeout(() => {
      if (isFraudAmount) {
        const bankNames = { chase: 'CHASE', wells: 'WELLS', citi: 'CITI' }
        const beneNames = { juan: 'J.PEREZ', maria: 'M.GARCIA', carlos: 'C.LOPEZ' }
        
        setShowHole(true)
        setHoleData({ 
          bank: bankNames[selectedBank], 
          beneficiary: beneNames[selectedBeneficiary] 
        })
        
        setTimeout(() => {
          setSpeed(30)
          setTurboActive(false)
          setCrashed(true)
          setCarPosition(38)
          setMessage(`! FRAUDE ${bankNames[selectedBank]} BLOQUEA!`)
          setIsFraud(true)
          
          setTimeout(() => {
            setCrashed(false)
            setShowHole(false)
            setCarPosition(5)
            setMessage('REINICIANDO...')
            setTimeout(() => {
              setMessage('LISTO PARA TRANSFERIR')
            }, 800)
          }, 2000)
        }, 500)
      } else {
        setIsFraud(false)
        setCrashed(false)
        setShowHole(false)
        const nonFraudCount = updatedHistory.filter(t => !t.isFraud).length
        const consecutiveNonFraud = updatedHistory
          .slice()
          .reverse()
          .findIndex(t => t.isFraud) === -1 
          ? updatedHistory.length 
          : updatedHistory.length - updatedHistory.slice().reverse().findIndex(t => t.isFraud) - 1

        if (consecutiveNonFraud >= 2) {
          setTurboActive(true)
          setSpeed(prev => Math.min(200, prev + 40))
          setCarPosition(prev => Math.min(35, prev + 5))
          setMessage('¡TURBO ACTIVADO!')
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 1500)
        } else {
          const speedBoost = Math.min(30, amount / 50)
          setSpeed(prev => Math.min(200, prev + speedBoost))
          setCarPosition(prev => Math.min(35, prev + 3))
          setMessage('* TRANSFERENCIA OK *')
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 1500)
        }
      }
      
      setTimeout(() => {
        setIsTransferring(false)
        setIsFraud(false)
        setMessage('LISTO PARA TRANSFERIR')
      }, 2000)
    }, 1500)

    setTransferAmount('')
  }

  const handleTurbo = () => {
    if (!turboActive && speed > 0) {
      setTurboActive(true)
      setSpeed(prev => Math.min(200, prev + 30))
      setMessage('¡TURBO ACTIVADO!')
    }
  }

  const getSpeedColor = () => {
    if (speed >= 150) return '#ff0040'
    if (speed >= 100) return '#ff8800'
    return '#00ff88'
  }

  const getSpeedLabel = () => {
    if (speed >= 150) return 'MAX'
    if (speed >= 100) return 'FAST'
    if (speed >= 50) return 'NORM'
    return 'IDLE'
  }

  return (
    <div className="game-container">
      <div className="scanlines"></div>
      <div className="screen-glow"></div>
      
      <header className="game-header">
        <div className="title">
          <span className="neon-text">VIBE</span>
          <span className="neon-text accent">BANK</span>
        </div>
        <div className="subtitle">TRANSFER ARCADE</div>
      </header>

      <div className="road-container">
        <div className="road" style={{ backgroundPositionX: `${roadOffset}%` }}>
          <div className="road-line center-line"></div>
        </div>
        
        {showHole && (
          <div className="hole">
            <div className="hole-label">{holeData.bank}</div>
            <div className="hole-name">{holeData.beneficiary}</div>
            <div className="hole-cross">X</div>
          </div>
        )}
        
        {showSuccess && (
          <div className="success-msg">
            <div className="success-text">TRANSFERIDO!</div>
            <div className="success-check">OK</div>
          </div>
        )}
        
        <div className="car-container" style={{ left: `${carPosition}%` }}>
          <div className={`car ${isTransferring ? 'car-shake' : ''} ${isFraud ? 'car-fraud' : ''} ${turboActive ? 'car-turbo' : ''}`}>
            <div className="car-body">
              <div className="car-top"></div>
              <div className="car-front"></div>
              <div className="car-window"></div>
              <div className="car-wheel front"></div>
              <div className="car-wheel back"></div>
              {turboActive && (
                <div className="turbo-flame"></div>
              )}
            </div>
            {exhaustParticles.map(p => (
              <div key={p.id} className="exhaust-particle" style={{ left: `${p.x}%`, top: `${p.y}%` }}></div>
            ))}
          </div>
          
          {isTransferring && (
            <div className="transfer-effect">
              <div className="money-flow"></div>
            </div>
          )}
        </div>

        <div className={`sky ${isFraud ? 'sky-fraud' : ''}`}>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="cloud" style={{ left: `${20 + i * 20}%`, animationDelay: `${i * 0.5}s` }}></div>
          ))}
        </div>
      </div>

      <div className="dashboard">
        <div className="speedometer">
          <div className="speed-dial">
            <div className="speed-needle" style={{ transform: `rotate(${-90 + (speed / 200) * 180}deg)` }}></div>
          </div>
          <div className="speed-value">
            <span className="speed-number" style={{ color: getSpeedColor() }}>{speed}</span>
            <span className="speed-unit">KM/H</span>
          </div>
          <div className="speed-label" style={{ color: getSpeedColor() }}>{getSpeedLabel()}</div>
        </div>

        <div className="turbo-indicator">
          <div className={`turbo-button ${turboActive ? 'active' : ''}`} onClick={handleTurbo}>
            <span>TURBO</span>
            <div className="turbo-bar">
              <div className={`turbo-fill ${turboActive ? 'filling' : ''}`}></div>
            </div>
          </div>
          {turboActive && <div className="turbo-label">TURBO!</div>}
        </div>

        <div className="transfer-panel">
          <div className="select-row">
            <div className="select-group">
              <span className="display-label">BANCO</span>
              <select 
                value={selectedBank} 
                onChange={(e) => setSelectedBank(e.target.value)}
                className="retro-select"
                disabled={isTransferring}
              >
                <option value="chase">CHASE BANK</option>
                <option value="wells">WELLS FARGO</option>
                <option value="citi">CITIBANK</option>
              </select>
            </div>
            <div className="select-group">
              <span className="display-label">DESTINO</span>
              <select 
                value={selectedBeneficiary} 
                onChange={(e) => setSelectedBeneficiary(e.target.value)}
                className="retro-select"
                disabled={isTransferring}
              >
                <option value="juan">JUAN PEREZ</option>
                <option value="maria">MARIA GARCIA</option>
                <option value="carlos">CARLOS LOPEZ</option>
              </select>
            </div>
          </div>
          
          <div className="transfer-display">
            <span className="display-label">MONTO</span>
            <input
              type="number"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0.00"
              className="amount-input"
              disabled={isTransferring}
            />
            <span className="currency">USD</span>
          </div>
          
          <button 
            className={`transfer-button ${isTransferring ? 'transferring' : ''}`}
            onClick={handleTransfer}
            disabled={isTransferring}
          >
            {isTransferring ? 'TRANSFIRIENDO...' : 'TRANSFERIR'}
          </button>
        </div>

        <div className="status-display">
          <div className={`message-box ${isFraud ? 'fraud' : ''} ${turboActive ? 'turbo' : ''}`}>
            {message}
          </div>
        </div>
      </div>

      <div className="transfer-history">
        <div className="history-title">HISTORIAL</div>
        <div className="history-items">
          {lastTransfers.map((t, i) => (
            <div key={i} className={`history-item ${t.isFraud ? 'fraud' : 'ok'}`}>
              <span className="history-amount">${t.amount.toFixed(2)}</span>
              <span className="history-status">{t.isFraud ? 'FRAUD' : 'OK'}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="controls-hint">
        <span>$ Ingresa monto y presiona TRANSFERIR</span>
        <span>* 2 transferencias seguidas = TURBO</span>
        <span>! mayor $1000 = FRAUDE</span>
      </div>
    </div>
  )
}

export default App