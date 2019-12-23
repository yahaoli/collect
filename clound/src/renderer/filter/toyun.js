import NP from "number-precision";
export default function toyun(Vue){
    Vue.filter("toyun",(val)=>{
        return NP.strip(val/100);
    })
}