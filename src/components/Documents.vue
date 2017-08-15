<template lang="jade">
v-container
  v-layout(wrap='')
    v-flex(xs12='', sm12='', md6='', lg6='')
      v-card
        v-toolbar.primary(dark='')
          v-icon(dark='') insert_drive_file
          v-toolbar-title
            | {{api.trans('literals.dynamic_documents')}}
        // <v-card-text>
        v-list(two-line='')
          v-list-tile(v-for='document in documents', :key='document.id')
            v-list-tile-action(@click='selectDocument(document)')
              v-icon.accent--text() fa-file-pdf-o
            v-list-tile-content(@click='selectDocument(document)')
              v-list-tile-title {{document.title}}
              small {{document.description}}
            v-list-tile-action
              v-btn(small='', icon='', :href="document.url + '/api?token='+api.user.token", target='document')
                v-icon.accent--text file_download
        // </v-card-text>
    v-flex(xs12='', sm12='', md6='', lg6='')
      v-card
        v-card-text(style='height:480px')
          iframe(v-if='document && document.url', :src="document.url + '/api?token='+ api.user.token", frameborder='0', style='width:100%;height:450px')
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
      console.log(document)
    }
  }
}
</script>


<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
