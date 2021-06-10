import http from "./api";

class DadosServicos {

    getAll() {
      return http.get("/produtos");
    }
  
    get(id) {
      return http.get(`/produtos/${id}`);
    }
  
    create(data) {
      return http.post("/produtos", data);
    }
  
    update(id, data) {
      return http.put(`/produtos/${id}`, data);
    }
  
    delete(id) {
      return http.delete(`/produtos/${id}`);
    }
  
    deleteAll() {
      return http.delete(`/produtos`);
    }
  
    findByNome(nome) {
      return http.get(`/produtos?nome=${nome}`);
    }
  }
  
  export default new DadosServicos();