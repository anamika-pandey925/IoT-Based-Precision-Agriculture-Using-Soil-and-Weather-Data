import React,{useState,useEffect} from 'react';
import {NavLink,useNavigate} from 'react-router-dom';
import {FaSeedling,FaGauge,FaChartLine,FaRobot,FaMap,FaCloudSun,FaPaw,FaIndianRupeeSign,FaWater,FaSun,FaMoon,FaBars,FaXmark,FaCamera,FaSliders} from 'react-icons/fa6';
import {useTheme} from '../../context/ThemeContext';
import {useSensor} from '../../context/SensorContext';
import styles from './Navbar.module.css';

const NAV=[
  {to:'/',icon:<FaGauge/>,label:'Dashboard'},
  {to:'/analytics',icon:<FaChartLine/>,label:'Analytics'},
  {to:'/ai',icon:<FaRobot/>,label:'AI'},
  {to:'/weather',icon:<FaCloudSun/>,label:'Weather'},
  {to:'/detection',icon:<FaPaw/>,label:'Detection'},
  {to:'/market',icon:<FaIndianRupeeSign/>,label:'Market'},
  {to:'/map',icon:<FaMap/>,label:'Map'},
  {to:'/overflow',icon:<FaWater/>,label:'Overflow'},
];

export default function Navbar({onScanClick}){
  const {isDark,toggleTheme}=useTheme();
  const {state}=useSensor();
  const navigate=useNavigate();
  const [open,setOpen]=useState(false);
  const [clock,setClock]=useState('');

  useEffect(()=>{
    const tick=()=>setClock(new Date().toLocaleTimeString('en-IN',{hour12:false}));
    tick();const id=setInterval(tick,1000);return()=>clearInterval(id);
  },[]);

  const online=state.serverStatus==='online';
  const offline=state.serverStatus==='offline';
  const dot=online?'online':offline?'offline':'warning';
  const txt=online?'Online':offline?'Offline':'Connecting';

  return(<>
    <nav className={styles.navbar} role="navigation" aria-label="Main Navigation">
      <NavLink to="/" className={styles.brand} aria-label="AgriSense Home">
        <div className={styles.brandIcon} aria-hidden="true"><FaSeedling/></div>
        <span className={styles.brandName}>AgriSense</span>
      </NavLink>

      <ul className={styles.navLinks} role="list">
        {NAV.map(({to,icon,label})=>(
          <li key={to}>
            <NavLink to={to} end={to==='/'} className={({isActive})=>`${styles.navLink}${isActive?' '+styles.active:''}`}>
              {icon} {label}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className={styles.navRight}>
        <div className={styles.statusPill} aria-live="polite">
          <span className={`status-dot ${dot}`} aria-hidden="true"/>
          <span className={styles.statusText}>{txt}</span>
          <span className={styles.clock}>{clock}</span>
        </div>
        <div className={styles.divider} aria-hidden="true"/>
        <button className="btn-icon" onClick={toggleTheme} aria-label={isDark?'Light mode':'Dark mode'} title="Toggle theme">
          {isDark?<FaSun/>:<FaMoon/>}
        </button>
        <button className="btn-icon" onClick={onScanClick} aria-label="Plant Scanner" title="AI Plant Scanner">
          <FaCamera/>
        </button>
        <button className="btn-icon" onClick={()=>navigate('/settings')} aria-label="Settings" title="Settings">
          <FaSliders/>
        </button>
        <button className={styles.hamburger} onClick={()=>setOpen(o=>!o)} aria-label={open?'Close menu':'Open menu'} aria-expanded={open}>
          {open?<FaXmark/>:<FaBars/>}
        </button>
      </div>
    </nav>

    <div className={`${styles.drawer}${open?' '+styles.open:''}`} aria-hidden={!open}>
      {NAV.map(({to,icon,label})=>(
        <NavLink key={to} to={to} end={to==='/'} className={({isActive})=>`${styles.drawerLink}${isActive?' '+styles.active:''}`} onClick={()=>setOpen(false)}>
          {icon} {label}
        </NavLink>
      ))}
    </div>
  </>);
}
