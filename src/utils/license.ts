export interface IChildTerm {
    label: string;
    values: string[];
}

export type TChildTerms = IChildTerm[];

export interface ILicense {
    term: string;
    isChildTerm: boolean;
    values: string[];
    childTerms: TChildTerms;
}

export type TLicenses = ILicense[];

export const license_title: string = "ĐIỀU KHOẢN SỬ DỤNG PHẦN MỀM CF15 OFFICE";

export const license_footer: string = "Bằng việc nhấn \"Đồng ý\", bạn xác nhận cam kết tuân thủ Điều khoản sử dụng này.";

export const license_right: string = "Tôi đã đọc và đồng ý với Điều khoản sử dụng!";

export const licenses: TLicenses = [
    {
        term: "1. Chấp nhận điều khoản",
        isChildTerm: false,
        values: [
            "Bằng việc đăng nhập và sử dụng phần mềm CF15 Office, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ các điều khoản sử dụng dưới đây. Nếu bạn không đồng ý, vui lòng không tiếp tục sử dụng phần mềm.",
        ],
        childTerms: []
    },
    {
        term: "2. Quyền sử dụng",
        isChildTerm: false,
        values: [
            "- Bạn được cấp quyền sử dụng phần mềm theo đúng vai trò được phân công (Lãnh đạo, Nhân viên, Văn thư, Quản trị, người lao động, quản lý đội...).",
            "- Không được sử dụng phần mềm vào mục đích cá nhân, thương mại hóa, phát tán hay gây hại đến hệ thống."
        ],
        childTerms: []
    },
    {
        term: "3. Bảo mật tài khoản",
        isChildTerm: false,
        values: [
            "- Bạn có trách nhiệm bảo mật tài khoản, mật khẩu và thiết bị truy cập.",
            "- Mọi hành động thực hiện dưới tài khoản của bạn được xem là do bạn chịu trách nhiệm.",
            "- Nghiêm cấm chia sẻ tài khoản hoặc cho người khác sử dụng trái phép."
        ],
        childTerms: []
    },
    {
        term: "4. Quy định sử dụng nội dung",
        isChildTerm: false,
        values: [
            "- Không được tạo, đăng tải, gửi hoặc chia sẻ thông tin vi phạm pháp luật, đạo đức, hoặc làm ảnh hưởng đến danh tiếng và dữ liệu của Công ty.",
            "- Văn bản, lịch làm việc, công việc, thông báo, tài liệu trên phần mềm là tài sản của Công ty, bạn không được sao chép, trích xuất trái phép."
        ],
        childTerms: []
    },
    {
        term: "5. Lưu trữ và xử lý dữ liệu",
        isChildTerm: false,
        values: [
            "- Tất cả dữ liệu trên phần mềm được hệ thống tự động lưu trữ, ghi nhận thời gian xử lý và luồng phê duyệt.",
            "- Văn bản ký số trên hệ thống có giá trị pháp lý nội bộ.",
            "- Mọi dữ liệu được bảo mật theo quy định của Công ty và pháp luật Việt Nam."
        ],
        childTerms: []
    },
    {
        term: "6. Giám sát và xử lý vi phạm",
        isChildTerm: false,
        values: [
            "- Mọi hoạt động sử dụng phần mềm có thể được ghi lại để phục vụ mục đích giám sát, kiểm tra.",
            "- Nếu phát hiện vi phạm, Công ty có quyền cảnh báo, khóa tài khoản, hoặc xử lý kỷ luật tùy mức độ."
        ],
        childTerms: []
    },
    {
        term: "7. Cập nhật điều khoản",
        isChildTerm: false,
        values: [
            "- Công ty có quyền thay đổi, cập nhật Điều khoản sử dụng bất kỳ lúc nào. Các thay đổi sẽ được thông báo trên hệ thống.",
            "- Việc tiếp tục sử dụng sau khi điều khoản thay đổi đồng nghĩa với việc bạn chấp nhận điều khoản mới."
        ],
        childTerms: []
    },
    {
        term: "8. Nhật ký sản xuất & truy xuất nguồn gốc",
        isChildTerm: true,
        values: [],
        childTerms: [
            {
                label: "8.1. Phạm vi áp dụng",
                values: [
                    "Tính năng “Nhật ký sản xuất và truy xuất nguồn gốc” được sử dụng trong các bộ phận có chức năng sản xuất, chế biến và quản lý chất lượng sản phẩm, nhằm:",
                    "   - Ghi nhận đầy đủ các công đoạn sản xuất.",
                    "   - Lưu trữ dữ liệu nguyên liệu, bán thành phẩm, thành phẩm.",
                    "   - Đáp ứng yêu cầu truy xuất nguồn gốc nội bộ và pháp lý."
                ]
            },
            {
                label: "8.2. Trách nhiệm của người dùng",
                values: [
                    "Người sử dụng tính năng nhật ký sản xuất có trách nhiệm:",
                    "   - Cập nhật chính xác, kịp thời các thông tin liên quan đến từng công đoạn sản xuất: ngày giờ, nguyên vật liệu, thiết bị, nhân công, kết quả kiểm tra.",
                    "   - Không được chỉnh sửa, xóa dữ liệu đã ghi nhận nếu không có quyền hoặc không có lý do chính đáng.",
                    "   - Không nhập dữ liệu giả mạo, không phản ánh đúng thực tế sản xuất."
                ]
            },
            {
                label: "8.3. Dữ liệu bắt buộc ghi nhận",
                values: [
                    "Tùy theo quy trình sản xuất, hệ thống có thể yêu cầu các trường thông tin bắt buộc, bao gồm nhưng không giới hạn:",
                    "   - Mã lô sản xuất, mã nguyên liệu đầu vào, mã thiết bị",
                    "   - Thời gian bắt đầu/kết thúc từng công đoạn.",
                    "   - Kết quả kiểm tra chất lượng, tồn kho, sai lỗi."
                ]
            },
            {
                label: "8.4. Bảo mật và sử dụng dữ liệu",
                values: [
                    "- Mọi dữ liệu nhật ký sản xuất được lưu trữ tối thiểu 5 năm, không bị xóa thủ công.",
                    "- Dữ liệu này được sử dụng để đối chiếu khi có sự cố sản phẩm, yêu cầu kiểm tra chất lượng hoặc thanh tra từ cơ quan quản lý nhà nước.",
                    "- Người dùng không được chia sẻ dữ liệu truy xuất ra ngoài hệ thống nếu không được ủy quyền bằng văn bản.",
                ]
            },
            {
                label: "8.5. Xử lý vi phạm",
                values: [
                    "Các hành vi vi phạm như: nhập sai dữ liệu cố ý, che giấu sai sót, làm giả nhật ký sản xuất... sẽ bị xử lý theo quy chế kỷ luật của Công ty và có thể bị truy cứu trách nhiệm dân sự, hình sự theo quy định của pháp luật về gian lận trong sản xuất, kinh doanh."
                ]
            },
        ]
    },
    {
        term: "9. Quy định về bảo mật thông tin",
        isChildTerm: true,
        values: [],
        childTerms: [
            {
                label: "9.1. Bảo mật hệ thống",
                values: [
                    "- Mọi thông tin, dữ liệu trên phần mềm CF15 Office là 𝘁𝗮̀𝗶 𝘀𝗮̉𝗻 𝗰𝘂̉𝗮 𝗖𝗼̂𝗻𝗴 𝘁𝘆 và được bảo vệ bởi các quy định nội bộ và pháp luật Việt Nam.",
                    "- Người dùng không được cố ý tấn công, khai thác lỗi hệ thống, phát tán virus, mã độc hoặc sử dụng công cụ gây hại đến hạ tầng phần mềm."
                ]
            },
            {
                label: "9.2. Bảo mật thông tin cá nhân và tổ chức",
                values: [
                    "- Cấm sao chép, chia sẻ, tiết lộ thông tin cá nhân, tài liệu nội bộ, bí mật kinh doanh, dữ liệu sản xuất cho bên thứ ba dưới mọi hình thức nếu không được phép bằng văn bản.",
                    "- Tất cả thao tác truy cập và xử lý dữ liệu đều được ghi nhật ký hệ thống phục vụ giám sát, điều tra khi cần."
                ]
            }
        ]
    },
    {
        term: "10. Bảo trì - Hỗ trợ - Cập nhật phần mềm",
        isChildTerm: true,
        values: [],
        childTerms: [
            {
                label: "10.1. Bảo trì và nâng cấp",
                values: [
                    "- Hệ thống có thể được bảo trì định kỳ hoặc đột xuất, trong thời gian đó, một số tính năng có thể bị gián đoạn. Thông báo sẽ được gửi trước qua phần mềm hoặc email.",
                    "- Các bản nâng cấp phần mềm nhằm cải thiện hiệu suất, bổ sung tính năng sẽ được cập nhật tự động hoặc có thông báo hướng dẫn cài đặt."
                ]
            },
            {
                label: "10.2. Hỗ trợ kỹ thuật",
                values: [
                    "- Người dùng gặp sự cố có thể liên hệ bộ phận quản trị hoặc kỹ thuật qua các kênh hỗ trợ chính thức như: email, số hotline nội bộ hoặc chat nội bộ.",
                    "- Bộ phận kỹ thuật có quyền truy cập vào hệ thống của người dùng với sự đồng ý để kiểm tra lỗi."
                ]
            },
        ]
    },
    {
        term: "11. Các hành vi bị nghiêm cấm",
        isChildTerm: false,
        values: [
            "Người dùng tuyệt đối không thực hiện các hành vi sau:",
            "   a) Mạo danh người khác để sử dụng phần mềm.",
            "   b) Truy cập trái phép vào dữ liệu không được phân quyền.",
            "   c) Can thiệp, chỉnh sửa dữ liệu, nhật ký hệ thống, hồ sơ công việc nếu không được phân công.",
            "   d) Sử dụng phần mềm cho mục đích cá nhân, ngoài phạm vi công việc.",
            "   e) Sao chép, sử dụng hoặc phát tán mã nguồn phần mềm, thuật toán xử lý, kiến trúc hệ thống trái phép."
        ],
        childTerms: []
    },
    {
        term: "12. Hiệu lực và cam kết tuân thủ",
        isChildTerm: false,
        values: [
            "- Tất cả cán bộ, nhân viên, lãnh đạo, đối tác có tài khoản truy cập phần mềm đều có trách nhiệm đọc kỹ và cam kết tuân thủ điều khoản sử dụng này.",
            "- Việc vi phạm một phần hay toàn bộ các quy định nêu trên có thể dẫn tới xử lý kỷ luật, bồi thường, hoặc truy cứu trách nhiệm theo quy định của pháp luật."
        ],
        childTerms: []
    },
];
