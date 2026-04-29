import React,{useEffect,useRef,useState} from 'react';
import {FaArrowUp,FaArrowDown,FaMinus} from 'react-icons/fa6';
import styles from './SensorCard.module.css';

export default function SensorCard({title,value,unit='',icon,colorClass='soil',subText='',subVariant='',loading=false,staggerIdx=1,trend=null}){
  const prev=useRef(value);
  const [flash,setFlash]=useState(false);

  useEffect(()=>{
    if(!loading&&value!==prev.current&&prev.current!==undefined){
      setFlash(true);
      const t=setTimeout(()=>setFlash(false),800);
      prev.current=value;
      return()=>clearTimeout(t);
    }
    prev.current=value;
  },[value,loading]);

  if(loading) return(
    <div className={`${styles.skel} stagger-${staggerIdx}`} aria-busy="true" aria-label={`Loading ${title}`}>
      <div className={styles.skelTop}>
        <div className={`${styles.skelIcon} skeleton`}/>
        <div className={`${styles.skelBadge} skeleton`}/>
      </div>
      <div className={`${styles.skelLabel} skeleton`}/>
      <div className={`${styles.skelValue} skeleton`}/>
      <div className={`${styles.skelSub} skeleton`}/>
    </div>
  );

  const TI=trend==='up'?FaArrowUp:trend==='down'?FaArrowDown:FaMinus;

  return(
    <div className={`${styles.card} ${styles[colorClass]} stagger-${staggerIdx} fade-in`} role="region" aria-label={title}>
      <div className={styles.topRow}>
        <div className={`${styles.icon} ${styles[colorClass]}`} aria-hidden="true">{icon}</div>
        {trend&&<div className={`${styles.trend} ${styles[trend]}`}><TI aria-hidden="true"/>{trend}</div>}
      </div>
      <div>
        <div className={styles.label}>{title}</div>
        <div className={`${styles.value}${flash?' '+styles.flash:''}`} aria-label={`${title}: ${value}${unit}`}>
          {value!=null?`${value}${unit}`:'--'}
        </div>
      </div>
      {subText&&(
        <div className={styles.sub}>
          <span className={`${styles.subDot} ${styles[subVariant||'default']}`} aria-hidden="true"/>
          <span className={`${styles.subText} ${styles[subVariant]}`}>{subText}</span>
        </div>
      )}
    </div>
  );
}
