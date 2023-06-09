const { IsEmail, IsNotEmpty } = require('class-validator');

module.exports = class UserDto {
  id;
  email;
  password;
  type;
  partner;
  partner_id;
  isActive;
  first_name;
  last_name;
  legal_name;

  constructor(model) {
    this.id = model.id;
    this.email = model.email;
    this.password = model.password;
    this.type = model.type;
    this.partner = model.partner;
    this.partner_id = model.partner_id;
    this.isActive = model.isActive;
    this.first_name = model.first_name;
    this.last_name = model.last_name;
    this.legal_name = model.legal_name;
  }

  validate() {
    const errors = [];

    if (!IsEmail(this.email)) {
      errors.push('Неверный формат email');
    }

    if (!IsNotEmpty(this.password)) {
      errors.push('Пароль не может быть пустым');
    }

    return errors;
  }
};
