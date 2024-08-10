//= require recurring_select_dialog
//= require_self

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("focusin", (e) => {
    if (e.target.matches(".recurring_select")) {
      recurring_select.call(e.target, "set_initial_values")
    }
  })

  document.addEventListener("input", (e) => {
    if (e.target.matches(".recurring_select")) {
      recurring_select.call(e.target, "changed")
    }
  })
})

const methods = {
  set_initial_values() {
    const str = this.querySelectorAll('option')[this.selectedIndex].textContent
    this.setAttribute('data-initial-value-hash', this.value);
    this.setAttribute('data-initial-value-str', str);
   },

  changed() {
    if (this.value == "custom") {
      methods.open.call(this);
    } else if (this.value == "null") {
      methods.close.call(this);
    } else {
      methods.set_initial_values.call(this,this.querySelectorAll('option')[this.selectedIndex].textContent);
      methods.close.call(this);
    }
  },

  close() {
    this.setAttribute("data-recurring-select-active", false);
    this.outer_holder = document.querySelector(".rs_dialog_holder");
    if (this.outer_holder) {
      const dialog = this.recurring_select_dialog;
      if (dialog && typeof dialog.destroyCalendar === 'function') {
        dialog.destroyCalendar();
      }
      this.outer_holder.remove();
    }
    this.recurring_select_dialog = null;
  },

  open() {
    this.setAttribute("data-recurring-select-active", true);
    this.recurring_select_dialog = new RecurringSelectDialog(this);
    this.blur();
  },

  save(new_rule) {
    this.querySelectorAll("option[data-custom]").forEach((el) => el.parentNode.removeChild(el) )
    const new_json_val = JSON.stringify(new_rule.hash)

    const options = Array.from(this.querySelectorAll("option")).map(() => this.value)
    if (!options.includes(new_json_val)) {
      this.selectedIndex = methods.insert_option.apply(this, [new_rule.str, new_json_val])
    }
    else {
      this.value = new_json_val
    }

    methods.set_initial_values.apply(this)
    this.options[this.selectedIndex].selected = true;
  },

  current_rule() {
    return {
      str: this.getAttribute("data-initial-value-str"),
      hash: JSON.parse(this.getAttribute("data-initial-value-hash"))
    };
  },

  cancel() {
    this.value = this.getAttribute("data-initial-value-hash")
    this.setAttribute("data-recurring-select-active", false);
    this.dispatchEvent(new CustomEvent("recurring_select:cancel"))
  },


  insert_option(new_rule_str, new_rule_json) {
    let separator = this.querySelectorAll("option[disabled]");
    if (separator.length === 0) {
      separator = this.querySelectorAll("option");
    }
    separator = separator[separator.length-1]

    const new_option = document.createElement("option")
    new_option.setAttribute("data-custom", true);

    if (new_rule_str.substring(new_rule_str.length - 1) !== "*") {
      new_rule_str+="*";
    }

    new_option.textContent = new_rule_str
    new_option.value = new_rule_json
    separator.parentNode.insertBefore(new_option, separator)

    return Array.from(this.options).indexOf(new_option);
  }
};

function recurring_select(method) {
  this['recurring_select'] = this['recurring_select'] || recurring_select.bind(this)
  if (method in methods) {
    return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ) );
  } else {
    throw new Error( `Method ${method} does not exist on recurring_select` );
  }
}
