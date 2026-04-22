import { DataNode } from 'antd/es/tree';

export const treeData: DataNode[] = [
  {
    title: 'Chuyển tiền trong nước',
    key: 'domestic-transfer',
    children: [
      {
        title: 'Chuyển tiền trong nước',
        key: 'domestic-transfer/level-2',
        children: [
          {
            title: 'Chuyển bằng VND',
            key: 'domestic-transfer/vnd',
            children: [
              {
                title: 'Chuyển tiền đi từ TKTT tại PVcomBank',
                key: 'domestic-transfer/vnd/from-current-account',
                children: [
                  {
                    title: 'Đến TKTT hoặc nhận bằng Giấy tờ tùy thân ngoài hệ thống PVcomBank',
                    key: 'domestic-transfer/vnd/from-current-account/to-outside',
                    children: [
                      {
                        title: 'Chuyển tiền trước 15h - Số tiền nhỏ hơn 500.000.000 VND',
                        key: 'domestic-transfer/vnd/from-current-account/to-outside/before-15h-lt-500m'
                      },
                      {
                        title: 'Chuyển tiền trước 15h - Số tiền lớn hơn 500.000.000 VND',
                        key: 'domestic-transfer/vnd/from-current-account/to-outside/before-15h-gt-500m'
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    title: 'Tài khoản',
    key: 'account',
    children: [
      {
        title: 'Tài khoản 1',
        key: 'account-1'
      }
    ]
  },
  {
    title: 'Tín dụng',
    key: 'credit',
    children: [
      {
        title: 'Tín dụng 1',
        key: 'credit-1'
      }
    ]
  },
  {
    title: 'Đơn vị chấp nhận thanh toán',
    key: 'merchant',
    children: [
      {
        title: 'Chuyển tiền trước 15h - Số tiền nhỏ hơn 500.000.000 VND',
        key: 'merchant/vnd/from-current-account/to-outside/before-15h-lt-500m'
      }
    ]
  },
  {
    title: 'Bảo lãnh',
    key: 'guarantee',
    children: [
      {
        title: 'Bảo lãnh 1',
        key: 'guarantee-1'
      }
    ]
  }
];

export const productListData = [
  {
    code: '1',
    name: 'Chuyển tiền trong nước',
    category: '1',
    codeFee: '',
    status: 'active',
    createdDate: '20/10/2025',
    createdBy: 'Mesut Ozil',
    editedDate: '20/12/2025',
    editedBy: 'Mesut Ozil',
    children: [
      {
        code: '1.2',
        name: 'Chuyển tiền trong nước',
        category: '2',
        codeFee: '',
        status: 'active',
        createdDate: '20/10/2025',
        createdBy: 'Connan',
        editedDate: '20/12/2025',
        editedBy: 'Mario',
        children: [
          {
            code: '1.3',
            name: 'Chuyển tiền trong nước',
            category: '3',
            codeFee: '',
            status: 'active',
            createdDate: '20/10/2025',
            createdBy: 'Connan',
            editedDate: '20/12/2025',
            editedBy: 'Mario',
            children: [
              {
                code: '1.4',
                name: 'Chuyển tiền trong nước',
                category: '4',
                codeFee: '',
                status: 'active',
                createdDate: '20/10/2025',
                createdBy: 'Connan',
                editedDate: '20/12/2025',
                editedBy: 'Mario',
                children: [
                  {
                    code: '1.5',
                    name: 'Chuyển tiền trong nước',
                    category: '5',
                    codeFee: '',
                    status: 'active',
                    createdDate: '20/10/2025',
                    createdBy: 'Connan',
                    editedDate: '20/12/2025',
                    editedBy: 'Mario',
                    children: [
                      {
                        code: '1.6',
                        name: 'Chuyển tiền trong nước',
                        category: '6',
                        codeFee: 'GD0161,GD0162,GD013,GD014,GD015,GD016',
                        status: 'active',
                        createdDate: '20/10/2025',
                        createdBy: 'Connan',
                        editedDate: '20/12/2025',
                        editedBy: 'Mario'
                      },
                      {
                        code: '1.6_more',
                        name: 'Chuyển tiền trong nước',
                        category: '6',
                        codeFee:
                          'GD0161,GD0162,GD013321231,GD014,GD015312321,GD016123123123,GD017,GD018,GD019',
                        status: 'active',
                        createdDate: '20/10/2025',
                        createdBy: 'Connan',
                        editedDate: '20/12/2025',
                        editedBy: 'Mario',
                        more: true
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  ...Array.from({ length: 50 }).map((_, i) => ({
    code: i + 2 + '',
    name: 'Chuyển tiền trong nước',
    category: '1',
    codeFee: '',
    status: 'active',
    createdDate: '20/10/2025',
    createdBy: 'Mesut Ozil',
    editedDate: '20/12/2025',
    editedBy: 'Mesut Ozil'
  }))
];
