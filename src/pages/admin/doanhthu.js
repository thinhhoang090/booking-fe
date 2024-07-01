import { useState, useEffect } from "react";
import {
  loadAllUser,
  lockOrUnlock,
  loadAuthority,
  changeRole,
} from "../../services/admin/user";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import $ from "jquery";
import DataTable from "datatables.net-dt";
import { getMethodByToken, uploadSingleFile } from "../../services/request";
import Swal from "sweetalert2";
import Chart from "chart.js/auto";

var token = localStorage.getItem("token");

const AdminDoanhThu = () => {
  const [rooms, setRooms] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    revenueYear(year, roomId);
  }, [year, roomId]);

  async function getRooms() {
    var url = "http://localhost:8080/api/room/public/findAll";
    const response = await fetch(url, {
      method: "GET",
      headers: new Headers({
        Authorization: "Bearer " + token,
      }),
    });
    var list = await response.json();
    setRooms(list);
  }

  useEffect(() => {
    getRooms();
  }, []);

  async function revenueYear(nam, roomId) {
    if (nam < 2000) {
      nam = new Date().getFullYear();
    }

    let url =
      "http://localhost:8080/api/statistic/admin/revenue-year?year=" + nam;

    if (roomId) {
      url =
        "http://localhost:8080/api/statistic/admin/revenue-room?year=" +
        nam +
        "&roomId=" +
        roomId;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: new Headers({
        Authorization: "Bearer " + token,
      }),
    });
    var list = await response.json();
    for (var i = 0; i < list.length; i++) {
      if (list[i] == null) {
        list[i] = 0;
      }
    }
    var lb = "doanh thu năm " + nam;
    if (roomId) {
      lb =
        "doanh thu năm " +
          nam +
          " Phòng " +
          rooms.find((room) => room.id == roomId)?.name || roomId;
    }

    const ctx = document.getElementById("chart").getContext("2d");
    let chartStatus = Chart.getChart("chart"); // <canvas> id
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }
    var myChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: [
          "tháng 1",
          "tháng 2",
          "tháng 3",
          "tháng 4",
          "tháng 5",
          "tháng 6",
          "tháng 7",
          "tháng 8",
          "tháng 9",
          "tháng 10",
          "tháng 11",
          "tháng 12",
        ],
        datasets: [
          {
            label: lb,
            backgroundColor: "rgba(161, 198, 247, 1)",
            borderColor: "rgb(47, 128, 237)",
            data: list,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                callback: function (value) {
                  return formatmoney(value);
                },
              },
            },
          ],
        },
      },
    });
  }

  function loadByNam() {
    var nam = document.getElementById("nams").value;
    var id = document.getElementById("rooms").value;

    setRoomId(id);
    setYear(nam);
  }

  const VND = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  function formatmoney(money) {
    return VND.format(money);
  }

  return (
    <div>
      <div class="col-sm-12 header-sp row ">
        <div class="col-md-3">
          <label class="lbbooking">Chọn năm cần xem</label>
          <select id="nams" class="form-control">
            <option id="2024">2024</option>
            <option id="2025">2025</option>
            <option id="2026">2026</option>
            <option id="2027">2027</option>
            <option id="2028">2028</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="lbbooking">Chọn phòng</label>
          <select id="rooms" class="form-control">
            <option defaultChecked value={""}>
              Tất cả
            </option>
            {rooms.map((room) => {
              return <option value={room.id}>{room.name}</option>;
            })}
          </select>
        </div>

        <div class="col-md-2">
          <label
            class="lbbooking whitespace"
            dangerouslySetInnerHTML={{ __html: "<span>&ThinSpace;</span>" }}
          ></label>
          <button
            onClick={() => loadByNam()}
            class="btn btn-primary form-control"
          >
            <i class="fa fa-filter"></i> Lọc
          </button>
        </div>
      </div>
      <div class="col-sm-12 divtale">
        <div class="card chart-container divtale">
          <canvas id="chart"></canvas>
        </div>
      </div>
    </div>
  );
};

export default AdminDoanhThu;
