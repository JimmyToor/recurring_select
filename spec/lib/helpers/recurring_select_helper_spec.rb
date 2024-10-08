require 'spec_helper'

describe RecurringSelectHelper do

  class FromTester
    include RecurringSelectHelper::FormOptionsHelper
  end

  describe "#recurring_options_for_select" do
    it "should use the correct options (basic)" do
      subject = FromTester.new
      expect(subject).to receive(:options_for_select).with(
        [
          ['- not recurring -', 'null'],
          ['Custom...', 'custom']
        ], 'null'
      )
      subject.recurring_options_for_select
    end

    it "should use the correct options (no defaults but custom rule)" do
      subject = FromTester.new
      expect(subject).to receive(:options_for_select).with(
        [
          ["Weekly", IceCube::Rule.weekly.to_hash.to_json],
          ['or', {:disabled => true}],
          ['Custom...', 'custom']
        ], IceCube::Rule.weekly.to_hash.to_json
      )
      subject.recurring_options_for_select(IceCube::Rule.weekly, [])
    end

    it "should use the correct options (defaults with no rule)" do
      subject = FromTester.new
      expect(subject).to receive(:options_for_select).with(
        [
          ["Weekly", IceCube::Rule.weekly.to_hash.to_json],
          ["Monthly", IceCube::Rule.monthly.to_hash.to_json],
          ['or', {:disabled => true}],
          ['Custom...', 'custom']
        ], 'null'
      )
      subject.recurring_options_for_select(nil, [IceCube::Rule.weekly, IceCube::Rule.monthly])
    end

    it "should use the correct options (non-recurring rule with defaults)" do
      subject = FromTester.new
      expect(subject).to receive(:options_for_select).with(
        [
          ["- not recurring -", 'null'],
          ["different", 1],
          ["Weekly", IceCube::Rule.weekly.to_hash.to_json],
          ['or', {:disabled => true}],
          ['Custom...', 'custom']
        ], '1'
      )
      subject.recurring_options_for_select(1, [["different", 1], IceCube::Rule.weekly], :allow_blank => true)
    end
  end
end
