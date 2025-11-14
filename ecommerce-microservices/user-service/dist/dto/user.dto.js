"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDto = exports.AddressDto = void 0;
class AddressDto {
    line1;
    line2;
    wardOrDistrict;
    city;
    province;
    country;
    postalCode;
    isDefault;
}
exports.AddressDto = AddressDto;
class UserDto {
    id;
    username;
    email;
    role;
    phone;
    avatar;
    isActive;
    lastLogin;
    createdAt;
    updatedAt;
    address;
}
exports.UserDto = UserDto;
//# sourceMappingURL=user.dto.js.map