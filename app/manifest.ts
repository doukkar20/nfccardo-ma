import type {MetadataRoute} from "next";
export default function manifest():MetadataRoute.Manifest{return{name:"NFCcardo.ma",short_name:"NFCcardo",description:"Votre carte de visite NFC premium au Maroc",start_url:"/",display:"standalone",background_color:"#08090c",theme_color:"#7c5cff",icons:[{src:"/nfccardo-3d-logo.png",sizes:"1024x1024",type:"image/png",purpose:"maskable"}]}}
