require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const dns = require('dns');

// Basic Configuration
const port = process.env.PORT || 3000;
const mySecret = process.env['URL_URI']

mongoose.connect(mySecret/*, { useNewUrlParser: true, useUnifiedTopology: true }*/)

const urlSchema = new mongoose.Schema({
  original_url: {type: String, required: true, unique: true},
  short_url: {type: Number, requried: true, unique: true}
})

const Url = mongoose.model('Url', urlSchema)

app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  let url = req.body.url;
  let short = Math.floor(Math.random() * 1000000000)
  // validate url
  try {
    urlCheck = new URL(url);
    dns.lookup(urlCheck.hostname, (err, address, family) =>{
      // if domain is invalid
      if(!address){
        res.json({error: 'invalid url'})
      } 
      // if domain is valid
      else {
        Url.findOne({original_url: url}).then(data => {
          if(!data){
            let newUrl = new Url({original_url: url, short_url: short})
            newUrl.save().then(data => {
            
              res.json({original_url: data.original_url, short_url: data.short_url})
            })
          }
          else {
            res.json({original_url: data.original_url, short_url: data.short_url})
          }
        })        
      }
    })
  // evaluate if checked url has valid domain
    
  // if not valid url, return error
  } catch {
    res.json({error: 'invalid url'})
  }
});

app.get('/api/shorturl/:short', (req, res) => {
  let short = req.params.short;
  Url.findOne({short_url: short}).then(data => {
    if(!data){
      res.json({error: 'short url not found'})
    }else{
    res.redirect(data.original_url)
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

