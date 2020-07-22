<template>
  <keep-alive :include="keepList">
    <router-view />
  </keep-alive>
</template>
<script>
import viewContentMixin from '@/mixins/view-content'
import RouteEnums from '@/enum/types/routeEnums'

export default {
  name: RouteEnums.${{RouteEnum}},
  mixins: [viewContentMixin],
}
</script>
