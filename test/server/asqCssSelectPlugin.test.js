"use strict";

var chai = require('chai');
var sinon = require("sinon");
var should = chai.should();
var expect = chai.expect;
var cheerio = require('cheerio');
var Promise = require('bluebird');
var modulePath = "../../lib/asqCssSelectPlugin";
var fs = require("fs");

describe("asqCssSelectPlugin.js", function(){
  
  before(function(){
    var then =  this.then = function(cb){
      return cb();
    };

    var create = this.create = sinon.stub().returns({
      then: then
    });

    this.tagName = "asq-css-select";

    this.asq = {
      registerHook: function(){},
      db: {
        model: function(){
          return {
            create: create
          }
        }
      }
    }

    //load html fixtures
    this.simpleHtml = fs.readFileSync(require.resolve('./fixtures/simple.html'), 'utf-8');
    this.noStemHtml = fs.readFileSync(require.resolve('./fixtures/no-stem.html'), 'utf-8');
    this.solutionsHtml = fs.readFileSync(require.resolve('./fixtures/solutions.html'), 'utf-8');
    
    this.asqCssSelectPlugin = require(modulePath);
  });

  describe("parseHtml", function(){

    before(function(){
     sinon.stub(this.asqCssSelectPlugin.prototype, "processEl").returns("res");
    });

    beforeEach(function(){
      this.asqcs = new this.asqCssSelectPlugin(this.asq);
      this.asqCssSelectPlugin.prototype.processEl.reset();
      this.create.reset();
    });

    after(function(){
      this.asqCssSelectPlugin.prototype.processEl.restore();
    });

    it("should call processEl() for all asq-css-select elements", function(done){
      this.asqcs.parseHtml(this.simpleHtml)
      .then(function(){
        this.asqcs.processEl.calledTwice.should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err)
      })
    });

    it("should call `model().create()` to persist parsed questions in the db", function(done){
      this.asqcs.parseHtml(this.simpleHtml)
      .then(function(result){
        this.create.calledOnce.should.equal(true);
        this.create.calledWith(["res", "res"]).should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err)
      })
    });

    it("should resolve with the file's html", function(done){
      this.asqcs.parseHtml(this.simpleHtml)
      .then(function(result){
        expect(result).to.equal(this.simpleHtml);
        done();
      }.bind(this))
      .catch(function(err){
        done(err)
      })
    });

  });

  describe("processEl", function(){

    before(function(){
     sinon.stub(this.asqCssSelectPlugin.prototype, "parseCode").returns("code");
    });

    beforeEach(function(){
      this.asqcs = new this.asqCssSelectPlugin(this.asq);
      this.asqCssSelectPlugin.prototype.parseCode.reset();
    });

    after(function(){
     this.asqCssSelectPlugin.prototype.parseCode.restore();
    });

    it("should assign a uid to the question if there's not one", function(){
      var $ = cheerio.load(this.simpleHtml);
      
      //this doesn't have an id
      var el = $("#no-uid")[0];
      this.asqcs.processEl($, el);
      $(el).attr('uid').should.exist;
      $(el).attr('uid').should.not.equal("a-uid");

      //this already has one
      el = $("#uid")[0];
      this.asqcs.processEl($, el);
      $(el).attr('uid').should.exist;
      $(el).attr('uid').should.equal("a-uid");
    });

    it("should call parseCode()", function(){
      var $ = cheerio.load(this.simpleHtml);
      var el = $(this.tagName)[0];

      this.asqcs.processEl($, el);
      this.asqcs.parseCode.calledOnce.should.equal(true);
    });

    it("should find the stem if it exists", function(){
      var $ = cheerio.load(this.simpleHtml);
      var el = $("#no-uid")[0];
      var elWithHtmlInStem = $("#uid")[0];

      var result = this.asqcs.processEl($, el);
      expect(result.data.stem).to.equal("This is a stem");

      var result = this.asqcs.processEl($, elWithHtmlInStem);
      expect(result.data.stem).to.equal("<h3>Select &apos;div&apos; elements:</h3>");


      var $ = cheerio.load(this.noStemHtml);
      var el = $("#no-uid")[0];
      var result = this.asqcs.processEl($, el);
      expect(result.data.stem).to.equal("");


    });

    it("should return correct data", function(){
      var $ = cheerio.load(this.simpleHtml);
      var el = $("#uid")[0];

      var result = this.asqcs.processEl($, el);
      expect(result._id).to.equal("a-uid");
      expect(result.type).to.equal(this.tagName);
      expect(result.data.stem).to.equal("<h3>Select &apos;div&apos; elements:</h3>");
      expect(result.data.code).to.equal("code");
    });
  });

  describe("parseCode", function(){

    beforeEach(function(){
      this.$ = cheerio.load(this.simpleHtml);
      this.asqcs = new this.asqCssSelectPlugin(this.asq);
    });

    it("should return the correct data", function(){
      var el = this.$("#uid")[0];
      var result = this.asqcs.parseCode(this.$, el);
      // var correctData = this.$(el).attr("htmlcode");
      expect(result).to.equal("<ul><li class='daclass'><ul id='ghouan'><li></li><li></li><li></li></ul></li><li></li><li></li><li><div><p></p><p class='pclass'></p></div></li></ul>");
    });

   

  });
});
