import React from 'react';
const shapes={
 HeartPulse:'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8ZM3 12h4l2-3 3 6 2-3h7',
 ShieldCheck:'M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Zm-4-11 3 3 5-6',
 X:'M18 6 6 18M6 6l12 12',
 Activity:'M22 12h-4l-3 9L9 3l-3 9H2',
 CalendarDays:'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z',
 ChevronLeft:'m15 18-6-6 6-6',
 ChevronRight:'m9 18 6-6-6-6',
 Droplet:'M12 22a8 8 0 0 0 8-8c0-4-8-12-8-12S4 10 4 14a8 8 0 0 0 8 8Z',
 LogOut:'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9',
 Plus:'M12 5v14m-7-7h14',
 Trash2:'M3 6h18m-2 0-1 14H6L5 6m3 0V4h8v2m-7 4v6m4-6v6',
 Pencil:'m16 4 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z',
 TrendingUp:'m3 17 6-6 4 4 8-8m-6 0h6v6'
};
export function Icon({name,size=20,...props}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={shapes[name]||shapes.Activity}/></svg>}
export const HeartPulse=p=> <Icon name="HeartPulse" {...p}/>;
export const ShieldCheck=p=> <Icon name="ShieldCheck" {...p}/>;
export const X=p=> <Icon name="X" {...p}/>;
export const Activity=p=> <Icon name="Activity" {...p}/>;
export const CalendarDays=p=> <Icon name="CalendarDays" {...p}/>;
export const ChevronLeft=p=> <Icon name="ChevronLeft" {...p}/>;
export const ChevronRight=p=> <Icon name="ChevronRight" {...p}/>;
export const Droplet=p=> <Icon name="Droplet" {...p}/>;
export const LogOut=p=> <Icon name="LogOut" {...p}/>;
export const Plus=p=> <Icon name="Plus" {...p}/>;
export const Trash2=p=> <Icon name="Trash2" {...p}/>;
export const Pencil=p=> <Icon name="Pencil" {...p}/>;
export const TrendingUp=p=> <Icon name="TrendingUp" {...p}/>;
