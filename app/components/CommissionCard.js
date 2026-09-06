export default function CommissionCard({ ratio = 0, current = 0, target = 500 }){
  const progress = Math.min(100, Math.round((current/target)*100 || 0))
  return (
    <div className="rounded-lg p-6" style={{background:'linear-gradient(90deg,#7c3aed,#6d28d9)',color:'#fff'}}>
      <h3 style={{margin:0,fontSize:16,fontWeight:600}}>My Commission Ratio</h3>
      <div style={{fontSize:36,fontWeight:800,marginTop:10}}>{ratio}%</div>
      <div style={{marginTop:12}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
          <div>${current}/0%</div>
          <div>${target}/{ratio}%</div>
        </div>
        <div style={{height:10,background:'rgba(255,255,255,0.15)',borderRadius:10,marginTop:8}}>
          <div style={{height:10,width:`${progress}%`,background:'#ffcc00',borderRadius:10}} />
        </div>
      </div>
      <div style={{marginTop:8,fontSize:12,opacity:0.95}}>${Math.max(0,target-current)} more to reach {ratio}% ratio</div>
    </div>
  )
}
