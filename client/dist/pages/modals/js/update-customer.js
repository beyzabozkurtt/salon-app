const companyToken = localStorage.getItem("companyToken");
const axiosConfig = {
  headers: {
    Authorization: "Bearer " + companyToken,
  },
};

window.updateCustomer = async function (e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  try {
    await axios.put(`http://localhost:5001/api/customers/${data.id}`, data, axiosConfig);
    bootstrap.Modal.getInstance(document.getElementById("updateModal")).hide();
    window.location.reload();
    const event = new Event("customers-updated");
    window.dispatchEvent(event);
  } catch (err) {
    alert("Müşteri güncellenirken hata oluştu.");
    console.error(err);
  }
};
