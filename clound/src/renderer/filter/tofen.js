import NP from "number-precision";
export default function tofen(Vue){
    Vue.filter("tofen",(val)=>{
        return NP.strip(val*100);
    })
}