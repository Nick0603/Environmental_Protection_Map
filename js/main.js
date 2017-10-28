var map;
let url = "https://www.jinma.io/MsgsByGeoAppUser?CLat=25.020906514227516&CLng=121.51634216308597&SLat=0.16737343279938344&SLng=0.98876953125&AppID=167VMeshFbCnk&UserID=122T7S2KEs9iw&Token=9rbWvWusZJcLP6yyB4vXdp";
let api_url = {
    create:"https://www.jinma.io/MsgCreate",
    delete:"https://www.jinma.io/MsgDelete",
    update:"https://www.jinma.io/MsgUpdate",
}
let myToken = "9rbWvWusZJcLP6yyB4vXdp";
let appointedMaker;
var markerArr = [];
const init_lat =  25.032805631783415;
const init_lng =  121.53985977172854;


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat:init_lat, lng:init_lng},
        zoom: 13
    });
    ajaxCallJsonp(url,useMapDataSuccess,useMapDataFail);  
    
    map.addListener('click', function(e) {
        placeMarkerAndPanTo(e.latLng,map);
        $("#info_form-lat").val( e.latLng.lat() );
        $("#info_form-lng").val( e.latLng.lng() );
    });
}

function placeMarkerAndPanTo(latLng, map) {
    if(window.appointedMaker)window.appointedMaker.setMap(null);
    window.appointedMaker = new google.maps.Marker({
        position: latLng,
        map: map
        });
    map.panTo(latLng);
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
    $.each(msg.Msgs,createNewMarker);
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
    marker.addListener('mouseover', ()=>{
        infowindow.open(marker.get('map'), marker);
    });
    marker.addListener('mouseout', ()=>{
        infowindow.close(marker.get('map'), marker);
    });
}


function createNewMarker(i=0,item){
    console.log(item);
    if(item.IsDeleted)return;
    var marker = new google.maps.Marker({
        position: {
            lat: item.Lat,
            lng: item.Lng
        },
        map: map
    });
    attachSecretMessage(marker,item.Body);
    markerArr.push({
        ID:item.ID,
        marker:marker
    })
    var tr_Body = $("<td>").text(item.Body).addClass("info_tody-Body");
    tr_Body.click(()=>{
        map.setCenter({
            lat:item.Lat,
            lng:item.Lng
        });
    })
    var newTr = $("<tr>")
        .attr("Body",item.Body)
        .attr("ID",item.ID)
        .append(tr_Body)
        .append($("<td>")
            .append($("<button>").addClass("btn btn-warning info_tbody-update").text("更新"))
            .append($("<button>").addClass("btn btn-danger info_tbody-delete").text("刪除"))
        )
    $(".info-tbody").append(newTr);
}

$(".info-tbody").on("click",".info_tbody-update",function(){
    var thisTr = $(this).closest("tr");
    var ID = $(thisTr).attr("ID");
    var Body = $(thisTr).attr("Body");
    swal({
        title: '更新資料',
        html:
          '<h2>ID</h2>'+
          '<input id="swal-ID" class="swal2-input disabled" disabled value="'+ ID + '">' +
          '<h2>Body</h2>'+
          '<input id="swal-Body" class="swal2-input" value="'+ Body + '">'
          ,
        focusConfirm: false,
        preConfirm: function () {
          return new Promise(function (resolve) {
            resolve({
                ID:$('#swal-ID').val(),
                Body:$('#swal-Body').val()
            });
          })
        }
      }).then(function (data) {
          console.log(data);
        $.ajax({
            type:"POST",
            url:api_url.update,
            data: {
                MsgID:data.ID,
                Body:data.Body,
                Token:myToken
            },
        })
        .done((result)=>{
            swal(
                '更新成功',
                '你已經更新成' + data.Body + " 這個名稱了！",
                'success'
              )
              createNewMarker(0,result);
            console.log(result)
            window.result = result;
            $(thisTr).find(".info_tody-Body").text(result.Body);
        })
        .fail(function( e ) {
            swal( e )
            console.log(e)
            window.e = e;
        })
      }).catch(swal.noop)
})

$(".info-tbody").on("click",".info_tbody-delete",function(){
    var thisTr = $(this).closest("tr");
    var ID = $(thisTr).attr("ID");
    var Body = $(thisTr).attr("Body");
    swal({
        title: '你確定要刪除嗎?',
        input: 'textarea',
        inputPlaceholder: '寫下你的刪除原因',
        text: "刪除後，將無法復原資料",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '確定刪除',
        cancelButtonText: '取消',
        showLoaderOnConfirm: true,
      }).then(function (reason) {
        if (reason) {
            $.ajax({
                type:"POST",
                url:api_url.delete,
                data: {
                    MsgID:ID,
                    Reason:reason,
                    Token:myToken
                },
            })
            .fail(function( e ) {
                // if api success, it  will return 200 No Error 
                swal(
                    '刪除!',
                    Body + '已經被刪除了！',
                    'success'
                )
                thisTr.remove();
                markerArr
                    .filter((item)=>{return item.ID == ID})
                    .each((item)=>{item.marker.setMap(null)});
            })
        }
      }).catch(swal.noop)
})

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
        url:api_url.create,
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
            '你已經新增了' + body + " 這個新位置",
            'success'
          )
          createNewMarker(0,result);
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