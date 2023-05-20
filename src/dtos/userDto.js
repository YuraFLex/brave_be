const { IsEmail, IsNotEmpty } = require('class-validator');

module.exports = class UserDto {
  id;
  email;
  password;
  type;
  partner;
  isActive;

  constructor(model) {
    this.id = model.id;
    this.email = model.email;
    this.password = model.password;
    this.type = model.type;
    this.partner = model.partner;
    this.isActive = model.isActive;
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
