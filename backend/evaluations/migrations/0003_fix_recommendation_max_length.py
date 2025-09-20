# Generated for fixing max_length issue

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('evaluations', '0002_llm_enhanced_evaluation'),
    ]

    operations = [
        migrations.AlterField(
            model_name='evaluation',
            name='recommendation',
            field=models.CharField(
                choices=[
                    ('highly_recommended', 'Highly Recommended'),
                    ('recommended', 'Recommended'),
                    ('conditionally_recommended', 'Conditionally Recommended'),
                    ('not_recommended', 'Not Recommended')
                ],
                default='not_recommended',
                max_length=30
            ),
        ),
    ]