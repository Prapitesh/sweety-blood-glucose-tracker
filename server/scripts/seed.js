import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {initializeDatabase,query,pool} from '../src/config/db.js';
try{
 const email=process.env.DEMO_EMAIL||'demo@sweety.app';
 const password=process.env.DEMO_PASSWORD;
 if(!password||password.length<8)throw new Error('Set DEMO_PASSWORD (at least 8 characters) in .env before seeding.');
 await initializeDatabase();
 const hash=await bcrypt.hash(password,12);
 const result=await query('INSERT INTO users(name,email,password_hash) VALUES($1,$2,$3) ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,password_hash=EXCLUDED.password_hash RETURNING id',['Sweety Demo',email,hash]);
 const id=result.rows[0].id;
 await query('DELETE FROM readings WHERE user_id=$1',[id]);
 const now=new Date();
 const asDate=n=>{const x=new Date(now);x.setDate(x.getDate()-n);return [x.getFullYear(),String(x.getMonth()+1).padStart(2,'0'),String(x.getDate()).padStart(2,'0')].join('-')};
 const sample=[[0,'morning',112],[0,'after_breakfast',148],[0,'after_lunch',136],[1,'morning',106],[1,'after_breakfast',142],[2,'morning',119],[3,'morning',109],[3,'after_dinner',155],[5,'morning',115]];
 for(const [n,slot,value] of sample)await query('INSERT INTO readings(user_id,reading_date,slot,value) VALUES($1,$2,$3,$4)',[id,asDate(n),slot,value]);
 console.log('Seeded demo account:',email);
}catch(e){console.error(e);process.exitCode=1}finally{await pool.end()}
