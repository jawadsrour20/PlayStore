
  /* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function showDropDown() {
    alert
    document.getElementById("myDropdown").classList.toggle("show");
  }
  
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
      }
    }
  }
  
  $('.toggle').click(function(e) {
    var toggle = this;
    
    e.preventDefault();
    
    $(toggle).toggleClass('toggle--usd')
           .toggleClass('toggle--lbp')
           .addClass('toggle--moving');
    
    setTimeout(function() {
      $(toggle).removeClass('toggle--moving');
    }, 200)
  });
  
  window.onload=function ipLookUp () {
    $.ajax('http://ip-api.com/json')
    .then(
        function success(response) {
          fetch("https://restcountries.eu/rest/v2/name/"+response.country).then(resp=>{
              return resp.json();
          }).then(json=>{
              var cnr = json[0].alpha2Code;
              var flagdiv = document.createElement("DIV");
              flagdiv.className = "flag-icon flag-icon-" + cnr;
              flagdiv.style.width = "100%";
              flagdiv.style.hieght = "50px";
              document.getElementById("ft").appendChild(flagdiv);
          })
        }
      );
  }
  
  var tabs = document.getElementsByClassName("tempTab");
var timeOutId;

for(var i = 0; i < tabs.length; i++){
    tabs[i].onmouseover = mouseOnTwo;
    tabs[i].onmouseout = mouseOut;
}

function mouseOnTwo(){
    var myElement = this;
    timeOutId = setTimeout(function(){
        showLargeTab(myElement)}
        , 3000);
}

function showLargeTab(elementId){
    var temp = elementId.cloneNode(true);
    temp.classList.remove("tempTab");
    console.log(temp);
    var myBody = document.getElementsByTagName("body")[0]; 
    temp.setAttribute("id","largeDiv");
    myBody.appendChild(temp);
    document.getElementsByClassName("container")[0].classList.add("blurBody");
}

function mouseOut(){
    if (document.getElementById("largeDiv"))
       { document.getElementById("largeDiv").remove();
       document.getElementsByClassName("container")[0].classList.remove("blurBody");}
    window.clearTimeout(timeOutId);
}
  

  /* EASING EXTEND */
jQuery.extend({myeas:function(a){var b="bez_"+jQuery.makeArray(arguments).join("_").replace(".","p");if(typeof jQuery.easing[b]!="function"){var c=function(a,b){var c=[null,null],d=[null,null],e=[null,null],f=function(f,g){return e[g]=3*a[g],d[g]=3*(b[g]-a[g])-e[g],c[g]=1-e[g]-d[g],f*(e[g]+f*(d[g]+f*c[g]))},g=function(a){return e[0]+a*(2*d[0]+3*c[0]*a)},h=function(a){var b=a,c=0,d;while(++c<14){d=f(b,0)-a;if(Math.abs(d)<.001)break;b-=d/g(b)}return b};return function(a){return f(h(a),1)}};jQuery.easing[b]=function(b,d,e,f,g){return f*c([a[0],a[1]],[a[2],a[3]])(d/g)+e}}return b}});

/* EACH FUNCTIONS */

$('.title').each(function(index, element) {
    var el = $(this);
  
  el.find('.bar').animate({width:'70%'},600,$.myeas([0.7, 0, 0.175, 1]));
  setTimeout(function(){
    el.find('.text').animate({width:'100%'},600,$.myeas([0.7, 0, 0.175, 1]));
  },300)
  
});

// START

class DropDown {

    constructor( dropdownId, initial=0 ) {

        // get all the elements (this.entries is an array containing all the entries)
        this.outerDiv = document.querySelector( `#${dropdownId}` );
        this.innerDiv = document.querySelector( `#${dropdownId} .inner` );
        this.entries  = Array.from( document.querySelectorAll( `#${dropdownId} p` ) );

        // state for the DropDown - the selected element is stored in this.selected
        // and this.open is true when the dropdown is open
        this.selected    = this.entries[initial];
        this.isOpen      = true;
        this.ignoreFocus = false;

        // close the menu to start with - hide all but selected element
        this.close();

        // add event listeners
        this.outerDiv.addEventListener( "pointerdown", event => this.pointerdown(event)  );
        this.outerDiv.addEventListener( "focusout",    event => this.focusout(event)     );
        this.outerDiv.addEventListener( "focusin",     event => this.focusin(event)      );

        this.entries.forEach( elm => elm.addEventListener( "pointerdown", () => this.clickEntry( event, elm ) ) );
        this.entries.forEach( elm => elm.addEventListener( "keydown",  event => this.keydown(    event, elm ) ) );

        // pipe addEventListener through to the outer div
        this.addEventListener = (...args) => this.outerDiv.addEventListener(...args);

        // also have an onchange event which can be assigned a function
        this.onchange = () => {};
    }

    close() {

        // menu is now closed
        this.isOpen = false;

        // hide all elements that aren't this.selected
        this.entries.forEach( elm => elm.className = elm == this.selected ? "" : "hidden" );
    }

    open() {

        // menu is now open
        this.isOpen = true;

        // make all elements visible
        this.entries.forEach( elm => elm.className = "" );
    }

    ignoreFocusWhileClosing() {

        // set ignoreFocus to true and set it back to false after the time it takes
        // to close the dropdown
        this.ignoreFocus = true;
        setTimeout( () => this.ignoreFocus = false, 220 )
    }

    focusin( event ) {

        // when one of the p elements inside gets focused, open the dropdown
        // unless this.ignoreFocus is true then do nothing
        if( !this.ignoreFocus ) this.open();
    }


    focusout( event ) {

        // when one of the p elements inside loses focus, close the dropdown
        // unless this.ignoreFocus is true then do nothing
        if( !this.ignoreFocus ) this.close();
    }

    pointerdown( event ) {

        // if the menu is closed open it or if it is open close it 
        if( this.isOpen ) {

            this.close();

            // need to ignore focus events while the menu is closing or it will re open
            this.ignoreFocusWhileClosing();
        }

        else this.open();
    }

    keydown( event, elm = null ) {

        // detec space or enter keypress
        if( event.key == " " || event.key == "Enter" ) {

            // avoid browser scrolling down on space
            event.preventDefault();

            // select the focused element and close the dropdown
            this.selected = elm;
            this.close();

            // call the onchange function
            this.onchange()
        }
    }

    clickEntry( event, elm = null ) {

        // when one of the entries is clicked, make it the selected one

        this.selected = elm;
      
        // call the onchange function
        this.onchange();

        // console.log(window.location);
        // Delay
        // https://www.sitepoint.com/delay-sleep-pause-wait/
        setTimeout(() => { window.location = window.location.href.substr(0, window.location.href.toString().length - 5)+"/wishlist"}, 2500);
    }

    get value() {

        return this.selected.innerHTML;
    }

    get index() {

        return this.entries.indexOf( this.selected );
    }

    set index( value ) {

        // set this.selected by the values provided
        this.selected = this.entries[value];

        // hide all elements that aren't this.selected
        this.entries.forEach( elm => elm.className = elm == this.selected ? "" : "hidden" );
    }
}

const functionDropdown = new DropDown("function-dropdown");





