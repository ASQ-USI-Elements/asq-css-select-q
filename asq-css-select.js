(function() {

  var p = {

    isQuestion_: true,
    type_: "asq-css-select",

    getSubmission: function() {
      if ( this.role !== this.Roles.VIEWER ) {
        return;
      }

      if ( typeof this.value == 'undefined' ) {
        this.value = "";
      }

      submisstion = this.value.replace(/[\s]+/g, " ").trim();
      
      return {
        questionId: "",
        timestamp: new Date(),
        submisstion: submisstion
      };
    },


    // Logic
    domReady: function() {

      var attr = this.attributes[0];
      if ( attr.nodeName === "htmlcode" ) {
          var newHtml = attr.value;
          var pane = this.$.codePane;
          var selInput = this.$.sel_input;
          
          this.initializeCssSelect(pane, selInput, newHtml);
      }
    },

    initializeCssSelect: function(codePane, selInput, newHtml) {
      var vDOM = document.createElement("div");
      vDOM.innerHTML = newHtml;
      var codeTree = createTree(vDOM, "", "");
      codePane.innerHTML = codeTree;
      // magic happens here
      selInput.addEventListener("input", function(){
          var value = selInput.value;
          var clone = vDOM.cloneNode(true);
          try {
              var selected = clone.querySelectorAll(value);
              selected.array().forEach(function(elem, index) {
                  elem.setAttribute('data-asq-selected', "true");
              });
              codeTree = createTree(clone, "", "");
              codePane.innerHTML = codeTree;
          } catch (err) {
              cleanUp(clone);
              codeTree = createTree(clone, "", "");
              codePane.innerHTML = codeTree;
          }     
      });

      function cleanUp(clone) {
          var selected = clone.querySelectorAll("[data-asq-selected]");
          selected.array().forEach(function(elem, index) {
              elem.removeAttribute('data-asq-selected');
          });
          return clone;
      }
    },

  }
  
  ASQ.mixin2(p, ASQ.ElementTypeMixin);
  ASQ.mixin2(p, ASQ.RoleMixin);
  ASQ.mixin2(p, ASQ.QuestionTypeMixin);
  Polymer('asq-css-select', p);

})();

//TODO: ????
// recursive function that creates the escaped tree of the html
// annotated with spans
function createTree(el, treeStr, tabwidth){
  // console.log("_____________createTree");
  var nextTabwidth = tabwidth || "";
  // console.log(el, el.childNodes);
  el.childNodes.array().forEach(function(elem, index){

      var spanOpenTag = "<span>";

      if(elem.getAttribute('data-asq-selected') === "true"){
          spanOpenTag = '<span style="background-color:#fd2343;">';
      }

      treeStr += tabwidth + spanOpenTag;
      treeStr += escapeHtml(getElOpeningTag(elem));
      treeStr += '</span>'+ '\n';


      //generate tree for children of current
      nextTabwidth = tabwidth + "  ";
      treeStr = createTree(elem, treeStr, nextTabwidth);

      //back to current 
      treeStr += tabwidth + spanOpenTag;
      treeStr +=  escapeHtml("</" + elem.tagName.toLowerCase() + ">");
      treeStr += '</span>'+ '\n';
  });
      
  return treeStr;

  function escapeHtml(string) {
    var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;',
      "/": '&#x2F;'
    };
    return String(string).replace(/[&<>"'\/]/g, function (s) {
      return entityMap[s];
    });
  }

  function getElOpeningTag(el){
    var str ="<";
    str += el.tagName.toLowerCase();
    
    //get all attribures
    el.attributes.array().forEach(function(elem) {
    // this.attributes is not a plain object, but an array
    // of attribute nodes, which contain both the name and value
        if(elem.specified && elem.name !=='data-asq-selected' ) {
          str += ' ' + elem.name;
          str += '="' + elem.value + '"';
        }
    });
    str+=">"
    return str;
  }

}






