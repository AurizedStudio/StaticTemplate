/*
 *  ホーム スライダー
 */
$(document).ready(function() {

  var sync1 = $("#is-slider01");
  var sync2 = $("#is-slider02");

  sync1.owlCarousel({
    singleItem : true,
    slideSpeed : 1000,
    navigation: true,
    navigationText: [
        "<i class='glyphicon glyphicon-chevron-left'></i>",
        "<i class='glyphicon glyphicon-chevron-right'></i>"
    ],
    pagination:false,
    afterAction : syncPosition,
    responsiveRefreshRate : 200,
    afterInit : function(elem){
        var that = this
        that.owlControls.prependTo(elem)
    }
  });

  sync2.owlCarousel({
    items : 10,
    itemsDesktop      : [1018,10],
    itemsDesktopSmall     : [939,8],
    itemsTablet       : [768,6],
    itemsMobile       : [479,5],
    pagination:false,
    responsiveRefreshRate : 100,
    afterInit : function(el){
      el.find(".owl-item").eq(0).addClass("synced");
    }
  });

  function syncPosition(el){
    var current = this.currentItem;
    $("#is-slider02")
      .find(".owl-item")
      .removeClass("synced")
      .eq(current)
      .addClass("synced")
    if($("#is-slider02").data("owlCarousel") !== undefined){
      center(current)
    }

  }

  $("#is-slider02").on("click", ".owl-item", function(e){
    e.preventDefault();
    var number = $(this).data("owlItem");
    sync1.trigger("owl.goTo",number);
  });

  function center(number){
    var sync2visible = sync2.data("owlCarousel").owl.visibleItems;

    var num = number;
    var found = false;
    for(var i in sync2visible){
      if(num === sync2visible[i]){
        var found = true;
      }
    }

    if(found===false){
      if(num>sync2visible[sync2visible.length-1]){
        sync2.trigger("owl.goTo", num - sync2visible.length+2)
      }else{
        if(num - 1 === -1){
          num = 0;
        }
        sync2.trigger("owl.goTo", num);
      }
    } else if(num === sync2visible[sync2visible.length-1]){
      sync2.trigger("owl.goTo", sync2visible[1])
    } else if(num === sync2visible[0]){
      sync2.trigger("owl.goTo", num-1)
    }
  }

});

/*
 * Homeページ portfolio
 */
$(function(){
   var $portfolioItem = $('.portfolio-item');
   $portfolioItem.on({
       'mouseenter': function(){
           $(this).find('.portfolio-item-title').addClass('is-portfolio-item-title');
       },
       'mouseleave': function(){
           $(this).find('.portfolio-item-title').removeClass('is-portfolio-item-title');
       }
   })
});

$(window).on("resize.spFlag",function(){
  if(window.matchMedia("(max-width: 939px)").matches){ // 930px以下の処理
    $('.portfolio-item:nth-child(4n)').removeClass('is-portfolio-item');
  }else{ // 940px以上の処理
    $('.portfolio-item:nth-child(4n)').addClass('is-portfolio-item');
  }
}).trigger("resize.spFlag");﻿
