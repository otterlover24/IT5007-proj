const mongoose=require('mongoose');

const Schema=mongoose.Schema;

const tradeSchema=new Schema({
userId:{
    type:String,
    required:true,
    trim:true

},
tradeTitle:{
    type:String,
    required:true,
    trim:true,
  
},
tradeType:{
    type:String,
    required:true,
    trim:true,
},
tradeAmount:{
    type:Number,
    required:true,
    trim:true,
},
tradeDate:{
    type:Date,
    required:true,
}
});

const Trade=mongoose.model('Trade',tradeSchema);
module.exports=Trade;