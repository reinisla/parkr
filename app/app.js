require(["./config"], function(){

    //MAIN APP
    require(["jquery", "view", "qr", "cam", "maps"], function($, view, qr, cam, map){

        //QR READER
        var scanFrame = true; //look for qr-code in frames

        qr.init();
        qr.on("decoded", function (event, data) {
            var regex = new RegExp("^[0-9]{3}-[0-9]{4}$", "i");
            if ((data.length > 0) && !regex.test(data)) {
                scanFrame = true; //not valid qr code, keep scanning frames
            } else {
                cam.stop();
                $("#cam").addClass("hidden");
                $("#location_id").val(data);
            }

        });
        qr.on("error", function (event, error) {
            console.log("error:", error);
            scanFrame = true;
        });

        //VIEWS
        view.init($("#view"));
        view.on("change", function(event, page){

            //HOME SCREEN
            if(page == "home") {
                //make sure no double binds
                $(document).off("click", "#accessCam");
                cam.off("capture");

                var canvas = $("#cam").get(0),
                    ctx = canvas.getContext('2d');

                cam.init(function() {
                    $(document).on("click", "#accessCam", function(){

                        if($("#cam:not(.hidden)").length){ //cam is running, stop it
                            $("#cam").addClass("hidden");
                            cam.stop();
                            scanFrame = true;
                        }else{
                            $("#cam").removeClass("hidden");
                            cam.start();
                            scanFrame = true;
                        }
                    });
                    cam.on("capture", function (event, frame) {
                        ctx.putImageData(frame, 0, 0);
                        if (scanFrame) {
                            var img = canvas.toDataURL('image/png');
                            if (img) {
                                qr.scan(img);
                            }
                            scanFrame = false; //don't scan more than one frame at the same time (reduce cpu time)
                        }
                    });
                });
            }

            //MAP SCREEN
            else if(page == "map"){

                map.init($("#google_map").get(0), {
                    lat: 55.403756,
                    lng: 10.402370
                });
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(function(position) {
                        map.addMarker(0, {lat: position.coords.latitude, lng: position.coords.longitude}, "You are here", "<p>You are here</p>");
                    });
                }
                map.addMarker(1, {lat: 55.403756, lng: 10.402370}, "Your car is here", "<p>Your car are here</p>");

            }




        });

        //delay load
        view.home();
        //setTimeout(function(){view.home();}, 1500);


        //NAVIGATION BAR
        $(document).on("click", "nav li", function(){
           var target = $(this).find("a").data("target");
            try {
                view[target]();
                $("nav ul li").removeClass("active");
                $(this).addClass("active");
            }catch(e){
                console.log("View: " + target + ", not found");
            }
        });

    });

});