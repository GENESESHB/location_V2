import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/* =========================================================
   Config (easy to extend)
========================================================= */
const DEFAULT_CITIES = [
  'Casablanca','Marrakesh','Agadir','Rabat','Fès','Tanger','Ouarzazate',
  'Béni Mellal','Essaouira','Laâyoune','Dakhla','Nador'
]

const monthsFR = ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre"]
const monthsShortFR = ["jan.","fév.","mar.","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."]

/* =========================================================
   Date helpers (null-safe)
========================================================= */
const fmtLabel = (d) => {
  if (!d || isNaN(d.getTime?.())) return ''
  const wd = ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."][(d.getDay()+7)%7]
  const m = monthsShortFR[d.getMonth()]
  return `${wd}, ${String(d.getDate()).padStart(2,"0")} ${m} ${d.getFullYear()}`
}
const toISO = (d) => (d && !isNaN(d.getTime?.())) ? d.toISOString().slice(0,10) : null
const daysInMonth = (y,m)=> new Date(y,m+1,0).getDate()
const startWeekday = (y,m)=> { const js=new Date(y,m,1).getDay(); return js===0?7:js }
const sameDay = (a,b)=> a&&b&&a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()
const between = (d,a,b)=> a&&b&&d>=a && d<=b

/* =========================================================
   Hooks
========================================================= */
function useOnEscape(handler){
  useEffect(()=>{
    const onKey=(e)=>{ if(e.key==='Escape') handler() }
    document.addEventListener('keydown', onKey)
    return ()=>document.removeEventListener('keydown', onKey)
  }, [handler])
}
function useOnClickOutside(ref, handler){
  useEffect(()=>{
    function onClick(e){
      if(!ref.current) return
      if(!ref.current.contains(e.target)) handler(e)
    }
    document.addEventListener('mousedown', onClick)
    return ()=>document.removeEventListener('mousedown', onClick)
  }, [ref, handler])
}

/* =========================================================
   CityDropdown (reusable)
========================================================= */
function CityDropdown({ open, label, cities=DEFAULT_CITIES, onSelect, onClose }){
  const boxRef = useRef(null)
  useOnClickOutside(boxRef, ()=>{ if(open) onClose?.() })
  if(!open) return null
  return (
    <div className="dropdown open" role="dialog" aria-label={label} aria-modal="false" ref={boxRef}>
      <div className="dropdown-header">
        <div className="dropdown-title">Villes populaires</div>
        <button type="button" className="dropdown-close" onClick={onClose} aria-label="Fermer">×</button>
      </div>
      <div className="popular-grid">
        {cities.map(c=>(
          <button key={c} type="button" className="popular-item" onClick={()=>onSelect?.(c)}>{c}</button>
        ))}
      </div>
    </div>
  )
}

/* =========================================================
   MonthGrid (internal to DateRangePicker)
========================================================= */
function MonthGrid({ year, month, isLeading, checkIn, checkOut, onDayClick, onPrev, onNext }){
  const dim = daysInMonth(year, month)
  const start = startWeekday(year, month)
  const cells = []
  for(let i=1;i<start;i++) cells.push({ key:`pad-${i}`, pad:true })
  for(let d=1; d<=dim; d++){
    const date=new Date(year, month, d)
    cells.push({ key:`${year}-${month}-${d}`, date, d })
  }
  return (
    <div className="cal">
      <div className="monthbar">
        {isLeading ? (
          <>
            <button className="navbtn" type="button" aria-label="Mois précédent" onClick={onPrev}>⟵</button>
            <div className="title">{monthsFR[month]} {year}</div>
            <div style={{width:32}} />
          </>
        ) : (
          <>
            <div style={{width:32}} />
            <div className="title">{monthsFR[month]} {year}</div>
            <button className="navbtn" type="button" aria-label="Mois suivant" onClick={onNext}>⟶</button>
          </>
        )}
      </div>
      <div className="wk"><div>Lun</div><div>Mar</div><div>Mer</div><div>Jeu</div><div>Ven</div><div>Sam</div><div>Dim</div></div>
      <div className="grid">
        {cells.map((c)=>{
          if(c.pad) return <div key={c.key} className="day disabled" />
          const date = c.date
          const classes=['day']
          if (between(date, checkIn, checkOut)) classes.push('in-range')
          if (sameDay(date, checkIn)){
            const i=classes.indexOf('in-range'); if(i!==-1) classes.splice(i,1)
            classes.push('start')
          }
          if (sameDay(date, checkOut)){
            const i=classes.indexOf('in-range'); if(i!==-1) classes.splice(i,1)
            classes.push('end')
          }
          return (
            <div key={c.key} className={classes.join(' ')} onClick={()=>onDayClick?.(date)}>
              {c.d}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* =========================================================
   DateRangePicker (reusable)
========================================================= */
function DateRangePicker({
  open,
  checkIn, checkOut,
  onChange,   // (newCheckIn, newCheckOut) => void
  onClose,
  initialViewStart = new Date(2025,9,1) // Oct 2025
}){
  const boxRef = useRef(null)
  useOnClickOutside(boxRef, ()=>{ if(open) onClose?.() })

  const [viewA, setViewA] = useState(new Date(initialViewStart.getFullYear(), initialViewStart.getMonth(), 1))
  const [viewB, setViewB] = useState(new Date(viewA.getFullYear(), viewA.getMonth()+1, 1))

  const prevA = useCallback(()=>{
    const a = new Date(viewA.getFullYear(), viewA.getMonth()-1, 1)
    setViewA(a); setViewB(new Date(a.getFullYear(), a.getMonth()+1, 1))
  }, [viewA])
  const nextB = useCallback(()=>{
    const b = new Date(viewB.getFullYear(), viewB.getMonth()+1, 1)
    setViewB(b); setViewA(new Date(b.getFullYear(), b.getMonth()-1, 1))
  }, [viewB])

  const onDayClick = useCallback((date)=>{
    if(!checkIn || (checkIn && checkOut)){
      onChange?.(date, null)
    } else {
      if(date < checkIn){ onChange?.(date, checkIn) }
      else { onChange?.(checkIn, date) }
    }
  }, [checkIn, checkOut, onChange])

  if(!open) return null
  return (
    <div className="daterange open" ref={boxRef}>
      <div className="dr-head">
        <div className="dr-input">Check-In: <span className="v">{fmtLabel(checkIn) || '—'}</span></div>
        <div className="dr-input">Check-Out: <span className="v">{fmtLabel(checkOut) || '—'}</span></div>
      </div>

      <MonthGrid
        year={viewA.getFullYear()} month={viewA.getMonth()} isLeading
        checkIn={checkIn} checkOut={checkOut}
        onDayClick={onDayClick}
        onPrev={prevA} onNext={()=>{}}
      />
      <div style={{marginTop:12}} />
      <MonthGrid
        year={viewB.getFullYear()} month={viewB.getMonth()}
        checkIn={checkIn} checkOut={checkOut}
        onDayClick={onDayClick}
        onPrev={()=>{}} onNext={nextB}
      />
    </div>
  )
}

/* =========================================================
   Main: HeroSearch
========================================================= */
export default function HeroSearch(){
  const [tab, setTab] = useState('car') // 'car' | 'lux'

  const [pickup, setPickup]   = useState('Béni Mellal, Maroc')
  const [dropoff, setDropoff] = useState('Béni Mellal, Maroc')
  const [samePlace, setSamePlace] = useState(false)

  const [pickupOpen, setPickupOpen]   = useState(false)
  const [dropoffOpen, setDropoffOpen] = useState(false)
  const [drOpen, setDrOpen]           = useState(false)

  const [checkIn, setCheckIn]   = useState(new Date(2025,9,12))
  const [checkOut, setCheckOut] = useState(new Date(2025,10,3))

  useOnEscape(()=>{ setPickupOpen(false); setDropoffOpen(false); setDrOpen(false) })
  useEffect(()=>{ if(samePlace) setDropoff(pickup) }, [pickup, samePlace])

  const datesInputValue = useMemo(()=>{
    if (!checkIn && !checkOut) return 'Sélectionner les dates'
    if (checkIn && !checkOut)  return fmtLabel(checkIn)
    if (!checkIn && checkOut)  return fmtLabel(checkOut)
    return `${fmtLabel(checkIn)} → ${fmtLabel(checkOut)}`
  }, [checkIn, checkOut])

  const closeAll = useCallback(()=>{ setPickupOpen(false); setDropoffOpen(false); setDrOpen(false) }, [])

  const selectCity = useCallback((which, v)=>{
    if(which==='pickup'){ setPickup(v); if(samePlace) setDropoff(v); setPickupOpen(false) }
    else { setDropoff(v); setDropoffOpen(false) }
  }, [samePlace])

  const onDateChange = useCallback((ci, co)=>{
    setCheckIn(ci); setCheckOut(co)
    if(ci && co) setTimeout(()=> setDrOpen(false), 120)
  }, [])

  const anyPanelOpen = pickupOpen || dropoffOpen || drOpen  // <— was missing before

  function onSubmit(e) {
    e.preventDefault()
    const allState = {
      tab,
      pickup,
      dropoff: samePlace ? pickup : dropoff,
      samePlace,
      pickupOpen,
      dropoffOpen,
      drOpen,
      checkIn,
      checkOut,
      checkInISO: toISO(checkIn),
      checkOutISO: toISO(checkOut),
      datesInputValue
    }
    console.group('%cALL STATE SNAPSHOT (Submit)','color:#4f46e5;font-weight:800')
    console.table(allState)
    console.log(allState)
    console.groupEnd()
    alert("Recherche envoyée ✅ (check console for full state)")
  }

  return (
    <section className="hero">
      {/* Switch */}
      <div className="switch" role="tablist" aria-label="Type de recherche" style={{marginTop:18, alignSelf:'center'}}>
        <button
          className={tab==='car' ? 'active' : ''}
          aria-selected={tab==='car' ? 'true' : 'false'}
          onClick={()=>setTab('car')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M199.2 181.4L173.1 256L466.9 256L440.8 181.4C436.3 168.6 424.2 160 410.6 160L229.4 160C215.8 160 203.7 168.6 199.2 181.4zM103.6 260.8L138.8 160.3C152.3 121.8 188.6 96 229.4 96L410.6 96C451.4 96 487.7 121.8 501.2 160.3L536.4 260.8C559.6 270.4 576 293.3 576 320L576 512C576 529.7 561.7 544 544 544L512 544C494.3 544 480 529.7 480 512L480 480L160 480L160 512C160 529.7 145.7 544 128 544L96 544C78.3 544 64 529.7 64 512L64 320C64 293.3 80.4 270.4 103.6 260.8zM192 368C192 350.3 177.7 336 160 336C142.3 336 128 350.3 128 368C128 385.7 142.3 400 160 400C177.7 400 192 385.7 192 368zM480 400C497.7 400 512 385.7 512 368C512 350.3 497.7 336 480 336C462.3 336 448 350.3 448 368C448 385.7 462.3 400 480 400z"/></svg>
          Voiture
        </button>
        <button
          className={tab==='lux' ? 'active' : ''}
          aria-selected={tab==='lux' ? 'true' : 'false'}
          onClick={()=>setTab('lux')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            width="24"
            height="24"
            fill="currentColor"
            aria-hidden="true"
            style={{ marginRight: 8 }}
          >
            <path d="M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM352 160C352 142.3 337.7 128 320 128C302.3 128 288 142.3 288 160C288 177.7 302.3 192 320 192C337.7 192 352 177.7 352 160zM320 480C355.3 480 384 451.3 384 416C384 399.8 378 384.9 368 373.7L437.5 234.8C443.4 222.9 438.6 208.5 426.8 202.6C415 196.7 400.5 201.5 394.6 213.3L325.1 352.2C323.4 352.1 321.7 352 320 352C284.7 352 256 380.7 256 416C256 451.3 284.7 480 320 480zM240 208C240 190.3 225.7 176 208 176C190.3 176 176 190.3 176 208C176 225.7 190.3 240 208 240C225.7 240 240 225.7 240 208zM160 352C177.7 352 192 337.7 192 320C192 302.3 177.7 288 160 288C142.3 288 128 302.3 128 320C128 337.7 142.3 352 160 352zM512 320C512 302.3 497.7 288 480 288C462.3 288 448 302.3 448 320C448 337.7 462.3 352 480 352C497.7 352 512 337.7 512 320z"/>
          </svg>
          Luxury
        </button>
      </div>

      {/* Card */}
      <div className="card" role="region" aria-label="Recherche de voiture">
        <div className="card-title">Où voulez-vous louer une voiture ?</div>

        <form className="form" onSubmit={onSubmit}>
          {/* Pickup */}
          <div className="field">
            <label htmlFor="pickupInput">Lieu de prise en charge</label>
            <svg className="icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>
            <input
              id="pickupInput"
              type="text"
              autoComplete="off"
              value={pickup}
              onFocus={()=>{ setDropoffOpen(false); setDrOpen(false); setPickupOpen(true) }}
              onChange={(e)=> setPickup(e.target.value)}
            />
            <CityDropdown
              open={pickupOpen}
              label="Villes populaires (prise en charge)"
              onSelect={(v)=>selectCity('pickup', v)}
              onClose={()=>setPickupOpen(false)}
            />
          </div>

          {/* Dropoff */}
          <div className="field">
            {!samePlace && <label htmlFor="dropoffInput">Retour</label>}
            <svg className="icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>
            <input
              id="dropoffInput"
              type="text"
              autoComplete="off"
              disabled={samePlace}
              className={samePlace ? 'is-disabled' : ''}
              value={samePlace ? pickup : dropoff}
              onFocus={()=>{ if(!samePlace){ setPickupOpen(false); setDrOpen(false); setDropoffOpen(true) } }}
              onChange={(e)=> setDropoff(e.target.value)}
            />
            <CityDropdown
              open={!samePlace && dropoffOpen}
              label="Villes populaires (retour)"
              onSelect={(v)=>selectCity('dropoff', v)}
              onClose={()=>setDropoffOpen(false)}
            />
          </div>

          {/* Dates */}
          <div
            className="field"
            tabIndex={0}
            onClick={()=>{ setPickupOpen(false); setDropoffOpen(false); setDrOpen(true) }}
            onFocus={()=>{ setPickupOpen(false); setDropoffOpen(false); setDrOpen(true) }}
          >
            <label>Période</label>
            <svg className="icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M7 2h10a2 2 0 0 1 2 2v2H5V4a2 2 0 0 1 2-2Zm12 6v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8h14Z"/></svg>
            <input type="text" readOnly value={datesInputValue} />

            <DateRangePicker
              open={drOpen}
              checkIn={checkIn}
              checkOut={checkOut}
              onChange={onDateChange}
              onClose={()=>setDrOpen(false)}
              initialViewStart={new Date(2025,9,1)}
            />
          </div>

          {/* CTA */}
          <button className="cta" type="submit" aria-label="Trouver une voiture">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M10 2a8 8 0 1 1 5.3 14l4.1 4.1-1.4 1.4-4.1-4.1A8 8 0 0 1 10 2Zm0 2a6 6 0 1 0 0 12A6 6 0 0 0 10 4Z"/></svg>
            Trouver une voiture
          </button>

          {/* Same place */}
          <label className="checkbox" style={{gridColumn:'1 / -1', color:'#fff'}}>
            <input
              id="samePlace"
              type="checkbox"
              checked={samePlace}
              onChange={(e)=>setSamePlace(e.target.checked)}
              style={{marginRight:8}}
            />
             <span style={{ color: 'black' }}>Retour au même endroit</span>
          </label>
        </form>
      </div>

      {/* Backdrop */}
      {anyPanelOpen && <div className="backdrop" onClick={closeAll} />}
    </section>
  )
}

