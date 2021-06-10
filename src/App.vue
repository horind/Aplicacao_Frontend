<template>
  <div id="app">
    <!-- <Grid/> -->
    <div class="container">

      <Toolbar class="p-mb-4">
        <template #left>
            <Button label="Novo" icon="pi pi-plus" class="p-button-success p-mr-2" @click="openNew" />
            <Button label="Excluir" icon="pi pi-trash" class="p-button-danger" @click="confirmDeleteSelected" :disabled="!selectedProducts || !selectedProducts.length" />
        </template>
      </Toolbar>

      <DataTable ref="dt" :value="products" :selection.sync="selectedProducts" dataKey="id"
        :paginator="true" :rows="10" :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown" :rowsPerPageOptions="[5,10,25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products">
          <template #header>
              <div class="table-header">
                  <h3 class="p-m-0">Gerenciar Produto</h3>
                  <span class="p-input-icon-left">
                      <i class="pi pi-search" />
                      <InputText v-model="filters['global']" placeholder="Nome do Produto..." />
                  </span>
              </div>
            </template>

          <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column field="codigo" header="Codigo" sortable></Column>
          <Column field="nome" header="Nome" sortable></Column>
          <Column field="preco" header="Preço" sortable>
              <template #body="slotProps">
                  {{formatCurrency(slotProps.data.preco)}}
              </template>
            </Column>
          <Column field="categoria" header="Categoria" sortable></Column>
          <Column field="status" header="Status" sortable>
              <template #body="slotProps">
                  <span :class="'product-badge status-' + slotProps.data.status.toLowerCase()">{{slotProps.data.status}}</span>
                </template>
            </Column>
          <Column>
            <template #body="slotProps">
                <Button icon="pi pi-pencil" class="p-button-rounded p-button-success p-mr-2" @click="editProduct(slotProps.data)" />
                <Button icon="pi pi-trash" class="p-button-rounded p-button-warning" @click="confirmDeleteProduct(slotProps.data)" />
              </template>
          </Column>
        </DataTable>
    </div>

    <Dialog :visible.sync="productDialog" :style="{width: '450px'}" header="Detalhes do Produto" :modal="true" class="p-fluid">
        <div class="p-field">
            <label for="nome">Nome</label>
            <InputText id="nome" v-model.trim="product.nome" required="true" autofocus :class="{'p-invalid': submitted && !product.nome}" />
            <small class="p-invalid" v-if="submitted && !product.nome">Nome é obrigatorio.</small>
          </div>
        <div class="p-field">
            <label for="descricao">Descrição</label>
            <Textarea id="descricao" v-model="product.descricao" required="true" rows="3" cols="20" />
          </div>
        <div class="p-field">
            <label for="status">Status</label><br/>
            <select name="status" id="status" v-model="product.status">
              <option value="EmEstoque">Em estoque</option>
              <option value="BaixoEstoque">Baixo Estoque</option>
              <option value="SemEstoque">Sem Estoque</option>
            </select>
          </div>
        <div class="p-field">
            <label class="p-mb-3">Categoria</label>
            <div class="p-formgrid p-grid">
                <div class="p-field-radiobutton p-col-6">
                    <RadioButton id="categoria1" name="categoria" value="Categoria1" v-model="product.categoria" />
                    <label for="categoria1">Categoria 1</label>
                  </div>
                <div class="p-field-radiobutton p-col-6">
                    <RadioButton id="categoria2" name="categoria" value="Categoria2" v-model="product.categoria" />
                    <label for="categoria2">Categoria 2</label>
                  </div>
                <div class="p-field-radiobutton p-col-6">
                    <RadioButton id="categoria3" name="categoria" value="Categoria3" v-model="product.categoria" />
                    <label for="categoria3">Categoria 3</label>
                  </div>
                <div class="p-field-radiobutton p-col-6">
                    <RadioButton id="categoria4" name="categoria" value="Categoria4" v-model="product.categoria" />
                    <label for="categoria4">Categoria 4</label>
                  </div>
              </div>
          </div>

        <div class="p-formgrid p-grid">
            <div class="p-field p-col">
                <label for="preco">Preço</label>
                <InputNumber id="preco" v-model="product.preco" mode="currency" currency="BRL" locale="pt-BR" />
              </div>
            <div class="p-field p-col">
                <label for="quantidade">Quantidade</label>
                <InputNumber id="quantidade" v-model="product.quantidade" integeronly />
              </div>
          </div>
        <template #footer>
            <Button label="Cancelar" icon="pi pi-times" class="p-button-text" @click="hideDialog"/>
            <Button label="Salvar" icon="pi pi-check" class="p-button-text" @click="saveProduct" />
          </template>
      </Dialog>

    <Dialog :visible.sync="deleteProductDialog" :style="{width: '450px'}" header="Confirmação" :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
            <span v-if="product">Tem certeza que quer deletar <b>{{product.nome}}</b>?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteProductDialog = false"/>
            <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteProduct" />
        </template>
      </Dialog>

    <Dialog :visible.sync="deleteProductsDialog" :style="{width: '450px'}" header="Confirmação" :modal="true">
        <div class="confirmation-content">
            <i class="pi pi-exclamation-triangle p-mr-3" style="font-size: 2rem" />
            <span v-if="product">Quer deletar os produtos selecionados?</span>
        </div>
        <template #footer>
            <Button label="Não" icon="pi pi-times" class="p-button-text" @click="deleteProductsDialog = false"/>
            <Button label="Sim" icon="pi pi-check" class="p-button-text" @click="deleteSelectedProducts" />
        </template>
      </Dialog>

  </div>
</template>

<script>
import DadosServicos from './services/DadosServicos';
import DataTable from 'primevue/datatable';
import Dialog from 'primevue/dialog';
import Toolbar from 'primevue/toolbar';
import Column from 'primevue/column';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import RadioButton from 'primevue/radiobutton';
import Textarea from 'primevue/textarea';

export default {
  name: 'App',
  components: {
    DataTable,
    Dialog,
    Toolbar,
    Column,
    InputNumber,
    InputText,
    Button,
    RadioButton,
    Textarea,
  },
  data() {
    return {
      products: null,
      productDialog: false,
      deleteProductDialog: false,
      deleteProductsDialog: false,
      product: {},
      selectedProducts: null,
      filters: {},
      submitted: false
    }
  },
  created() {
      DadosServicos.getAll()
      .then(response => {
      this.products = response.data
      });
  },
  methods: {
    formatCurrency(value) {
      return value.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    },
    openNew() {
      this.product = {};
      this.submitted = false;
      this.productDialog = true;
    },
    hideDialog() {
      this.productDialog = false;
      this.submitted = false;
    },
    saveProduct() {
      this.submitted = true;
      if (this.product.nome.trim()) {
        if (this.product.id) {
          this.$set(this.products, this.findIndexById(this.product.id), this.product);
          DadosServicos.update(this.product.id, this.product);
          this.productDialog = false;
          this.product = {};
        }else{
          this.product.codigo = this.createCodigo();
          DadosServicos.create(this.product);
          this.products.push(this.product);
          this.productDialog = false;
          this.product = {};
        }
      }
    },
    findIndexById(id) {
      let index = -1;
      for (let i = 0; i < this.products.length; i++) {
          if (this.products[i].id === id) {
              index = i;
              break;
          }
      }
      return index;
    },
    createCodigo() {
      let codigo = '';
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for ( var i = 0; i < 9; i++ ) {
          codigo += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return codigo;
    },
    editProduct(product) {
      this.product = {...product};
      this.productDialog = true;
    },
    confirmDeleteProduct(product) {
      this.product = product;
      this.deleteProductDialog = true;
    },
    deleteProduct() {
      this.products = this.products.filter(val => val.id !== this.product.id);
      DadosServicos.delete(this.product.id);
      this.deleteProductDialog = false;
      this.product = {};
    },
    confirmDeleteSelected() {
        this.deleteProductsDialog = true;
    },
    deleteSelectedProducts() {
      if(this.selectedProducts.length < this.products.length){
        this.selectedProducts.forEach(element => {
          DadosServicos.delete(element.id);
        });
      }else{
        DadosServicos.deleteAll();
      }
      this.products = this.products.filter(val => !this.selectedProducts.includes(val));
      this.deleteProductsDialog = false;
      this.selectedProducts = null;
    }
  }
}
</script>

<style scoped>
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.container{
  width: 99%;
  margin-right: auto;
  margin-left: auto;
  margin-top: 15px;
  border: 2px solid #c5d0d3;
  padding: 13px;
}

.p-m-0{
  color: black;
  font-weight: 600;
}

select{
  width: 100%;
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
