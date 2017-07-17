<template>
  <v-container>
    <v-layout wrap>
      <v-flex sm12 md6>
        <v-card>
          <v-toolbar class="primary" dark>
            <v-icon dark>insert_drive_file</v-icon>
            <v-toolbar-title>
              {{api.trans('literals.dynamic_documents')}}
            </v-toolbar-title>
          </v-toolbar>
          <!-- <v-card-text> -->
          <v-list two-line>
            <v-list-tile v-for="document in documents" :key="document.id" @click.native="selectDocument(document)">
              <v-list-tile-action>
                <v-icon fa class="red--text">file-pdf-o</v-icon>
              </v-list-tile-action>
              <v-list-tile-content>
                <v-list-tile-title>{{document.title}}</v-list-tile-title>
                <small>{{document.description}}</small>
              </v-list-tile-content>
            </v-list-tile>
          </v-list>
          <!-- </v-card-text> -->
        </v-card>
      </v-flex>
      <v-flex sm12 md6>
        <v-card>
          <v-card-text style="height:480px">
            <iframe :src="document.url" frameborder="0" style="width:100%;height:450px"></iframe>
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  name: 'Documents',
  mounted() {
    this.api.ready
      .then((data) => {
        this.getDocuments()
      })
      .catch(console.error)
  },
  data() {
    return {
      documents: [],
      document: {},
      api: require('../services/api.js'),
    }
  },
  methods: {
    getDocuments: function () {
      this.api.get('documents')
        .then((response) => {
          this.documents = response.data
          console.log(response.data)
        })
        .catch(console.error)
    },
    selectDocument: function (document) {
      this.document = document
    }
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
