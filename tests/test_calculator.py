import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import CalcRequest, calculate


def calc(**kw):
    base = dict(plot_area=200, road_width=9, building_height=9, building_type="residential")
    base.update(kw)
    return calculate(CalcRequest(**base))


def test_front_setback_slabs():
    assert calc(road_width=9)["front_setback"]["value"] == 3.0
    assert calc(road_width=10)["front_setback"]["value"] == 3.6
    assert calc(road_width=12)["front_setback"]["value"] == 3.6
    assert calc(road_width=15)["front_setback"]["value"] == 4.5
    assert calc(road_width=20)["front_setback"]["value"] == 6.0


def test_rear_setback_slabs():
    assert calc(plot_area=40)["rear_setback"]["value"] == 0.0
    assert calc(plot_area=150)["rear_setback"]["value"] == 1.5
    assert calc(plot_area=200)["rear_setback"]["value"] == 2.5
    assert calc(plot_area=300)["rear_setback"]["value"] == 3.0


def test_fee_residential_and_commercial():
    r = calc(plot_area=240, built_up_area=300)["permission_fee"]
    assert (r["app_fee"], r["sanction_fee"], r["value"]) == (300, 3000, 3300)
    c = calc(plot_area=240, built_up_area=300, building_type="commercial")["permission_fee"]
    assert c["sanction_fee"] == 4500


def test_tall_building_not_computed_from_rule_56():
    r = calc(plot_area=1200, building_height=20)
    assert r["front_setback"]["value"] is None
    assert "Lift mandatory" in r["lift_note"]


def test_high_rise_fee_not_computed():
    assert calc(plot_area=3000, building_height=40)["permission_fee"]["value"] is None


def test_aug_2026_exemption_and_instant_approval():
    assert "No separate T&CP" in calc(plot_area=300)["dev_permission"]
    assert "required" in calc(plot_area=600)["dev_permission"]
    assert calc(plot_area=186)["instant_approval"]
    assert not calc(plot_area=250)["instant_approval"]
