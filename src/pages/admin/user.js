import { useState, useEffect } from 'react'
import {loadAllUser,lockOrUnlock,loadAuthority,changeRole} from '../../services/admin/user'
import ReactPaginate from 'react-paginate';
import {toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import $ from 'jquery'; 
import DataTable from 'datatables.net-dt';


var size = 10
var token = localStorage.getItem("token");

async function loadUser(role){
    var url = 'http://localhost:8080/api/admin/get-user-by-role';
    if (role != "") {
        url += '?role=' + role
    }
    const response = await fetch(url, {
        method: 'GET',
        headers: new Headers({
            'Authorization': 'Bearer ' + token
        })
    });
    return response;
}

const AdminUser = ()=>{
    const [items, setItems] = useState([]);
    useEffect(()=>{
        const getUser = async(role) =>{
            var response = await loadUser(role);
            var listUser = await response.json();
            setItems(listUser)
        };
        getUser("");
    }, []);

    $( document ).ready(function() {
        if(items.length > 0){
            $('#example').DataTable({language:{search :"Tìm kiếm"}});
        }
    });

    async function filterUser(){
        $('#example').DataTable().destroy();
        var role = document.getElementById("role").value
        var response = await loadUser(role);
        var listUser = await response.json();
        setItems(listUser)
    }

    async function lockOrUnlock(id, type) {
        var con = window.confirm("Xác nhận hành động?");
        if (con == false) {
            return;
        }
        var url = 'http://localhost:8080/api/admin/lockOrUnlockUser?id=' + id;
        const response = await fetch(url, {
            method: 'POST',
            headers: new Headers({
                'Authorization': 'Bearer ' + token
            })
        });
        if (response.status < 300) {
            var mess = '';
            if (type == 1) {
                mess = 'Khóa thành công'
            } else {
                mess = 'Mở khóa thành công'
            }
            toast.success(mess);
            filterUser();
        } else {
            toast.error("Thất bại");
        }
    }
    

    return (
        <div>
            <div class="col-sm-12 header-sp">
                    <div class="row">
                        <div class="col-md-3 col-sm-6 col-6">
                            <label class="lb-form">Chọn quyền</label>
                            <select onChange={()=>filterUser()} id='role' class="form-control">
                                <option value="">Tất cả quyền</option>
                                <option value="ROLE_USER">Tài khoản người dùng</option>
                                <option value="ROLE_ADMIN">Tài khoản admin</option>
                            </select>
                        </div>
                    </div>
                </div>
            
                <div class="col-sm-12">
                    <div class="wrapper">
                    <table id="example" class="table table-striped tablefix">
                            <thead class="thead-tablefix">
                                <tr>
                                    <th>id</th>
                                    <th>Email</th>
                                    <th>Họ tên</th>
                                    <th>Số điện thoại</th>
                                    <th>Ngày tạo</th>
                                    <th>Quyền</th>
                                    <th>Khóa</th>
                                </tr>
                            </thead>
                            <tbody id="listuser">
                                {items.map((item=>{
                                    var btn = '';
                                    if (item.actived == 0) {
                                        var btn = <button onClick={()=>lockOrUnlock(item.id,0)} class="btn btn-danger"><i class="fa fa-unlock"></i> mở khóa</button>
                                    } else {
                                        var btn = <button onClick={()=>lockOrUnlock(item.id,1)} class="btn btn-primary"><i class="fa fa-lock"></i> Khóa</button>
                                    }
                                    return  <tr>
                                        <td>{item.id}</td>
                                        <td>{item.email}</td>
                                        <td>{item.fullname}</td>
                                        <td>{item.phone}</td>
                                        <td>{item.createdDate}</td>
                                        <td>{item.authorities.name}</td>
                                        <td class="sticky-col">
                                            {btn}
                                        </td>
                                    </tr>
                                }))}
                            </tbody>
                        </table>

                    </div>
                </div>


           
        </div>
    );
}

export default AdminUser;