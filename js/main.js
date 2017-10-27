var map;
let url = "https://www.jinma.io/MsgsByGeoAppUser?CLat=25.020906514227516&CLng=121.51634216308597&SLat=0.16737343279938344&SLng=0.98876953125&AppID=167VMeshFbCnk&UserID=122T7S2KEs9iw&Token=9rbWvWusZJcLP6yyB4vXdp";
let myToken = "9rbWvWusZJcLP6yyB4vXdp";
const init_lat =  25.032805631783415;
const init_lng =  121.53985977172854;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:init_lat, lng:init_lng},
        zoom: 13
    });
    ajaxCallJsonp(url,useMapDataSuccess,useMapDataFail);  
    // setYourPos({
    //     Zoom:13
    // }); 
}

function ajaxCallJsonp(target,success,fail){
    
    var data = $.getJSON(target,
    {
        tagmode: "any",
        format: "json",
    })
    .then(success)
    .catch(fail);
}

function setYourPos(data){
    var infoWindow = new google.maps.InfoWindow({map: map});  
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            infoWindow.setPosition(pos);
            infoWindow.setContent('You.');
            map.setCenter(pos);
            map.setZoom(data.zoom);
        }, function() {
        handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

var infoArr = [];
function useMapDataSuccess( msg ) {
    console.log(msg);

    $.each(msg.Msgs, function(i,item){
        console.log(i,item);
        console.log(item.Lng)
        var marker = new google.maps.Marker({
            position: {
                lat: item.Lat,
                lng: item.Lng
            },
            map: map
        });
        attachSecretMessage(marker,item.Body);

        var newTr = $("<tr>")
            .append($("<td>").text(i+1))
            .append($("<td>").text(item.ID))
            .append($("<td>").text(item.Body))
            .append($("<td>").text(item.Lat.toFixed(3)))
            .append($("<td>").text(item.Lng.toFixed(3)))
        $(".info-tbody").append(newTr);
        newTr.click(()=>{
            map.setCenter({
                lat:item.Lat,
                lng:item.Lng
            });
        })

    });
}

function useMapDataFail(e){
    console.log(e);
    console.log("error:" + e.statusText);
}

// Attaches an info window to a marker with the provided message. When the
// marker is clicked, the info window secretMessage open with the secret message.
function attachSecretMessage(marker, secretMessage) {
    var message = [
        "<div class='infowindow-title'>"+secretMessage+"</div>",
        "<div class='infowindow-content'> 提供服務:<預設> </div>",
        "<div class='infowindow-content'> 評價:<預設> </div>"
    ].join("");
    var infowindow = new google.maps.InfoWindow({
        content:message
    });
    marker.addListener('click', function() {
        infowindow.open(marker.get('map'), marker);
    });
}

$("#info_form-submit").click(()=>{
    $("#info_form-submit").prop('disabled', true);
    var lat = $("#info_form-lat").val();
    var lng = $("#info_form-lng").val();
    var body = $("#info_form-body").val();

    $("#info_form-lat").val("")
    $("#info_form-lng").val("");
    $("#info_form-body").val("");    
    $.ajax({
        type:"POST",
        url:"https://www.jinma.io/MsgCreate",
        data: {
            Lat:lat,
            Lng:lng,
            Body:body,
            Token:myToken
        },
    })
    .done((result)=>{
        swal(
            '新增成功',
            '你已經新增了' + this.body + " 這個新位置",
            'success'
          )
        swal( "新增成功" )
        console.log(result)
        window.result = result;
    })
    .fail(function( e ) {
        swal( e )
        console.log(e)
        window.e = e;
    })
    .always(()=>{
        $("#info_form-sumit").prop('disabled', false);
    })
});