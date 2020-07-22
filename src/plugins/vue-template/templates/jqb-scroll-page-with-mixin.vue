<template>
  <jqb-scroll-page
    class="${{className}} jqb-element-reset"
    :offsetTop="90"
    :finished="finished"
    :loading="loading"
    @onFixed="handleFixed"
    @onScroll="more">
    <jqb-operation-panel slot="header">
      <div slot="left">
        <jqb-row>
          <!--状态按钮组-->
        </jqb-row>
      </div>
      <div slot="right" class="${{className}}__header__action">
        <jqb-row>
          <!--操作按钮-->
        </jqb-row>
      </div>
    </jqb-operation-panel>
    <jqb-search-panel slot="search" @search="search" @reset="reset">
      <div slot="base" class="${{className}}__search__base">
        <!--搜索条件-->
        <jqb-panel-item class="mr60 mb10">
        </jqb-panel-item>
        <jqb-panel-item class="mr60 mb10">
        </jqb-panel-item>
      </div>
      <div slot="advance" class="${{className}}__search__advance">
        <jqb-panel-item class="mr60 mb10">
        </jqb-panel-item>
      </div>
    </jqb-search-panel>
    <jqb-table
      class="${{className}}__table"
      :list="list"
      :columns="columns"
      :is-loading="loading"
      :sticky-top="140"
      :is-fixed="fixed"
      :row-class-name="getRowClassName"
      @row-click="view($event.id)">
      <div slot="name" class="${{className}}__table__header">
      </div>
    </jqb-table>
  </jqb-scroll-page>
</template>
<script>
import { mapActions } from 'vuex';
import { permission, confirm } from '@/decorator';
import {
  PERMISSION_ACTION,
  PERMISSION_PAGE,
} from '@/enum/types/permissionEnums';
import RouteEnums from '@/enum/types/routeEnums';
import enumMixin from '@/mixins/enumMixin';
import scrollPageMixin from '@/mixins/scrollPageMixin';
import jqbHoverText from '@/components/jqb-hover-text';
import SvgIcon from '@/components/SvgIcon';
import { UNIT_KEY } from '@/enum/types/unitEnums';

export default {
  name: RouteEnums.${{RouteEnum}},
  mixins: [scrollPageMixin],
  data() {
    return {
      params: {
        pageSize: 30,
        page: 0,
      },
      columns: [
        {
          render: (h, { row }) =>
            h(SvgIcon, {
              props: {
                iconClass: 'ic_error',
              },
            })
        },
        {
          title: '',
          key: '',
          span: 8,
        },
      ],
    };
  },
  computed: {},
  watch: {},
  activated() {
    this.init();
  },
  methods: {
    ...mapActions('', ['', '']),
    async init() {
      
    },
    loadData() {

    },
    // 重置参数
    resetParams() {
      return {
        pageSize: 30,
        page: 0,
      };
    },
    async afterSearch() {
    },
  },
};
</script>
<style lang="scss">
.${{className}} {
  &__search {
    &__base,
    &__advance {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
    }
  }
  &__table {
    padding: 20px;
    padding-top: 0;
    &__header {
      display: flex;
      padding: 20px 0;
    }
  }
}
</style>
