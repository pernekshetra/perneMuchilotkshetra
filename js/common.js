
 var offsetToStickyBar = $(".stickyBar").offset().top;
 offsetToStickyBar = offsetToStickyBar - $(".navbar").height();
$(document).scroll(function(){
    if($(this).scrollTop() > offsetToStickyBar)
    {   
       $('#stickyBar').addClass('stickyBarFixed');
         $(".navbar").hide();
    } else {
       $('#stickyBar').removeClass('stickyBarFixed');
        $(".navbar").show();
    }
});
